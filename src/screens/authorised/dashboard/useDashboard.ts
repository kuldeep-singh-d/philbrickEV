import { routes } from '@routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AppState, LayoutChangeEvent, type AppStateStatus } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDeviceDimensions, useDispatch, useMqtt, useSelector } from '@hooks';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';
import { selectDeviceMqttTopic } from '@store/slices/devices/devices';
import {
  getMqttErrorDetails,
  getMqttUserMessage,
} from '../../../mqtt/mqttClient';
import { createDeviceMqttTopics, mqttPayloads } from '../../../mqtt/mqttTopics';
import {
  FAULT_LABELS,
  getActiveFaults,
  formatDuration,
  parseDashboardMessage,
  parsePhaseParametersMessage,
} from './dashboardData';
import useStyles from './styles';

export type DashboardAlertItem = {
  id: string;
  title: string;
};

const MIN_CURRENT = 1;
const MAX_CURRENT = 32;
const DEFAULT_CURRENT = 16;

const normalizeCurrent = (current: number) =>
  Math.max(MIN_CURRENT, Math.min(Math.round(current), MAX_CURRENT));

const getMessageText = (message: string, fallback: string) => {
  try {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const value =
      parsed.message ?? parsed.error ?? parsed.ack ?? parsed.status ?? fallback;

    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : fallback;
  } catch {
    return message.trim() || fallback;
  }
};

const getChargerErrorText = (message: string) => {
  try {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    const errorValue = parsed.error ?? parsed.fault ?? parsed.fault_status;
    const numericError =
      typeof errorValue === 'number'
        ? errorValue
        : typeof errorValue === 'string' && errorValue.trim()
        ? Number(errorValue)
        : undefined;

    if (numericError === 0) {
      return '';
    }

    if (numericError !== undefined && Number.isFinite(numericError)) {
      const activeFaults = getActiveFaults(numericError);

      if (activeFaults.length > 0) {
        return activeFaults
          .map(fault => FAULT_LABELS[fault] || fault)
          .join(', ');
      }
    }
  } catch {
    return getMessageText(message, 'The charger reported an error.');
  }

  return getMessageText(message, 'The charger reported an error.');
};

const getSessionDeviceId = (device: Record<string, unknown> | null) => {
  const value = device?.id ?? device?.device_id ?? device?.deviceId;

  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';
};

export const useDashboard = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const isFocused = useIsFocused();
  const { moderateWidth } = useDeviceDimensions();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const selectedDeviceId = selectDeviceMqttTopic(selectedDevice);
  const sessionDeviceId = useMemo(
    () => getSessionDeviceId(selectedDevice as Record<string, unknown> | null),
    [selectedDevice],
  );
  const topics = useMemo(
    () => createDeviceMqttTopics(selectedDeviceId),
    [selectedDeviceId],
  );
  const subscriptionTopics = useMemo(
    () => topics?.subscriptionTopics ?? [],
    [topics],
  );
  const mqtt = useMqtt({
    autoConnect: Boolean(topics),
    autoSubscribeTopics: subscriptionTopics,
    autoRetryCount: 2,
    disconnectOnUnmount: true,
  });
  const { disconnect, publish, retry } = mqtt;

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [responseIdMessage, setResponseIdMessage] = useState<string | null>(
    null,
  );
  const [isCharging, setIsCharging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipePosition, setSwipePosition] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isPublishingCommand, setIsPublishingCommand] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState('');
  const [commandFeedbackIsError, setCommandFeedbackIsError] = useState(false);
  const [chargerError, setChargerError] = useState('');
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [currentSetting, setCurrentSetting] = useState(DEFAULT_CURRENT);
  const [isSettingCurrent, setIsSettingCurrent] = useState(false);

  const isChargingRef = useRef(isCharging);
  const currentSettingRef = useRef(DEFAULT_CURRENT);
  const isSettingCurrentRef = useRef(false);
  const startSwipeRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const requestedDeviceRef = useRef('');
  const sessionStartRef = useRef<string | null>(null);
  const activeTimerStartedAtMsRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const telemetry = useMemo(
    () =>
      parseDashboardMessage(
        statusMessage,
        selectedDevice as Record<string, unknown> | null,
      ),
    [selectedDevice, statusMessage],
  );
  const phaseParameters = useMemo(
    () => parsePhaseParametersMessage(responseIdMessage, telemetry.phases),
    [responseIdMessage, telemetry.phases],
  );
  const isActiveChargingStatus =
    telemetry.cpStatus === 2 || telemetry.cpStatus === 5;

  const setCurrentValue = useCallback((current: number) => {
    const normalizedCurrent = normalizeCurrent(current);
    currentSettingRef.current = normalizedCurrent;
    setCurrentSetting(normalizedCurrent);
    return normalizedCurrent;
  }, []);

  useEffect(() => {
    setStatusMessage(null);
    setResponseIdMessage(null);
    setCommandFeedback('');
    setCommandFeedbackIsError(false);
    setChargerError('');
    setSessionElapsedSeconds(0);
    setIsCharging(false);
    setCurrentValue(DEFAULT_CURRENT);
    isSettingCurrentRef.current = false;
    setIsSettingCurrent(false);
    requestedDeviceRef.current = '';
    sessionStartRef.current = null;
    activeTimerStartedAtMsRef.current = null;

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, [selectedDeviceId, setCurrentValue]);

  useEffect(() => {
    if (
      isSettingCurrentRef.current ||
      telemetry.setCurrent === undefined ||
      !Number.isFinite(telemetry.setCurrent)
    ) {
      return;
    }

    setCurrentValue(telemetry.setCurrent);
  }, [setCurrentValue, telemetry.setCurrent]);

  useEffect(
    () => () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const latestMessage = mqtt.latestMessage;

    if (!latestMessage || !topics) {
      return;
    }

    try {
      if (latestMessage.topic === topics.subscribe.responseId) {
        setResponseIdMessage(latestMessage.message);
        return;
      }

      if (
        latestMessage.topic === topics.subscribe.status ||
        latestMessage.topic === topics.subscribe.legacyStatus
      ) {
        setStatusMessage(latestMessage.message);
        return;
      }

      if (latestMessage.topic === topics.subscribe.error) {
        setChargerError(getChargerErrorText(latestMessage.message));
        publish(topics.publish.errorAck, mqttPayloads.errorAck()).catch(
          error => {
            console.warn(
              '[Dashboard MQTT] error ack publish failed',
              getMqttErrorDetails(error),
            );
          },
        );
        return;
      }

      if (latestMessage.topic === topics.subscribe.remoteStartAck) {
        setCommandFeedbackIsError(false);
        setCommandFeedback(
          getMessageText(latestMessage.message, 'Charging start acknowledged.'),
        );
        return;
      }

      if (latestMessage.topic === topics.subscribe.remoteStopAck) {
        setCommandFeedbackIsError(false);
        setCommandFeedback(
          getMessageText(latestMessage.message, 'Charging stop acknowledged.'),
        );
      }
    } catch (error) {
      console.warn('[Dashboard MQTT] message handling failed', {
        topic: latestMessage.topic,
        payload: latestMessage.message,
        error: getMqttErrorDetails(error),
      });
    }
  }, [mqtt.latestMessage, publish, topics]);

  useEffect(() => {
    if (telemetry.auth !== undefined) {
      setIsCharging(telemetry.auth === 1);
    }
  }, [telemetry.auth]);

  useEffect(() => {
    if (!mqtt.isConnected) {
      requestedDeviceRef.current = '';
      return;
    }

    if (!topics || requestedDeviceRef.current === topics.deviceId) {
      return;
    }

    requestedDeviceRef.current = topics.deviceId;
    publish(topics.publish.requestId, mqttPayloads.requestId()).catch(error => {
      console.warn(
        '[Dashboard MQTT] request id publish failed',
        getMqttErrorDetails(error),
      );
      requestedDeviceRef.current = '';
      setCommandFeedbackIsError(true);
      setCommandFeedback(getMqttUserMessage(error));
    });
  }, [mqtt.isConnected, publish, topics]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'background') {
        disconnect().catch(error => {
          console.warn(
            '[Dashboard MQTT] background disconnect failed',
            getMqttErrorDetails(error),
          );
        });
      } else if (
        nextState === 'active' &&
        previousState.match(/inactive|background/)
      ) {
        retry();
      }
    });

    return () => subscription.remove();
  }, [disconnect, retry]);

  const syncChargingSession = useCallback(
    (startedAt: string, endedAt: string) => {
      if (!sessionDeviceId) {
        return;
      }

      dispatch(
        apiCallBegan({
          data: {
            started_at: startedAt,
            ended_at: endedAt,
          },
          isRowData: true,
          method: methods.POST,
          url: apiRoutes.chargingSessions(sessionDeviceId),
        }),
      );
    },
    [dispatch, sessionDeviceId],
  );

  useEffect(() => {
    const wasCharging = isChargingRef.current;

    if (wasCharging === isCharging) {
      return;
    }

    isChargingRef.current = isCharging;

    if (isCharging) {
      const startedAt = new Date();
      const startedAtIso = startedAt.toISOString();

      sessionStartRef.current = startedAtIso;
      setSessionElapsedSeconds(0);
      syncChargingSession(startedAtIso, startedAtIso);

      return;
    }

    const startedAt = sessionStartRef.current;

    if (!startedAt) {
      return;
    }

    const endedAt = new Date();

    syncChargingSession(startedAt, endedAt.toISOString());
    sessionStartRef.current = null;
  }, [isCharging, syncChargingSession]);

  useEffect(() => {
    if (!isActiveChargingStatus) {
      const startedAtMs = activeTimerStartedAtMsRef.current;

      if (startedAtMs !== null) {
        setSessionElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
        );
        activeTimerStartedAtMsRef.current = null;
      }

      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      return;
    }

    const startedAtMs = Date.now();
    activeTimerStartedAtMsRef.current = startedAtMs;
    setSessionElapsedSeconds(0);

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }

    sessionTimerRef.current = setInterval(() => {
      setSessionElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
      );
    }, 1000);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [isActiveChargingStatus]);

  const handleWidth = moderateWidth(16);
  const maxSwipeDistance = useMemo(
    () => Math.max(0, trackWidth - handleWidth),
    [handleWidth, trackWidth],
  );

  useEffect(() => {
    setSwipePosition(isCharging ? maxSwipeDistance : 0);
  }, [isCharging, maxSwipeDistance]);

  const handleTrackLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      setTrackWidth(nativeEvent.layout.width);
    },
    [],
  );

  const activeAlerts = useMemo(() => {
    const chargerAlerts = chargerError
      ? chargerError
          .split(',')
          .map(alert => alert.trim())
          .filter(Boolean)
          .map((title, index) => ({
            id: `charger-alert-${index}`,
            title,
          }))
      : [];
    return [
      ...new Map(
        [
          ...chargerAlerts,
          ...getActiveFaults(telemetry.faultStatus).map(fault => ({
            id: fault,
            title: FAULT_LABELS[fault],
          })),
        ].map(alert => [alert.title, alert]),
      ).values(),
    ];
  }, [chargerError, telemetry.faultStatus]);

  useEffect(() => {
    if (isFocused) {
      return;
    }

    const navigationState = navigation.getState();
    const activeRoute = navigationState.routes[navigationState.index];

    if (activeRoute?.name === routes.app.alerts) {
      navigation.navigate(routes.app.alerts, { alerts: activeAlerts });
    }
  }, [activeAlerts, isFocused, navigation]);

  const handleAlertsPress = useCallback(() => {
    navigation.navigate(routes.app.alerts, { alerts: activeAlerts });
  }, [activeAlerts, navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate(routes.app.settings);
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setCommandFeedback('');
    setCommandFeedbackIsError(false);
    setChargerError('');
    retry();
  }, [retry]);

  const adjustCurrent = useCallback(
    async (change: number) => {
      if (!topics || !mqtt.isConnected || isSettingCurrentRef.current) {
        return;
      }

      const previousCurrent = currentSettingRef.current;
      const nextCurrent = normalizeCurrent(previousCurrent + change);

      if (nextCurrent === previousCurrent) {
        return;
      }

      setCurrentValue(nextCurrent);
      isSettingCurrentRef.current = true;
      setIsSettingCurrent(true);
      setCommandFeedback('');
      setCommandFeedbackIsError(false);

      try {
        await publish(
          topics.publish.setCurrent,
          mqttPayloads.setCurrent(nextCurrent),
        );
        setCommandFeedback(`Charging current set to ${nextCurrent} A.`);
      } catch (error) {
        console.warn(
          '[Dashboard MQTT] set current publish failed',
          getMqttErrorDetails(error),
        );
        setCurrentValue(previousCurrent);
        setCommandFeedbackIsError(true);
        setCommandFeedback(getMqttUserMessage(error));
      } finally {
        isSettingCurrentRef.current = false;
        setIsSettingCurrent(false);
      }
    },
    [mqtt.isConnected, publish, setCurrentValue, topics],
  );

  const handleCurrentDecrease = useCallback(() => {
    adjustCurrent(-1).catch(() => undefined);
  }, [adjustCurrent]);

  const handleCurrentIncrease = useCallback(() => {
    adjustCurrent(1).catch(() => undefined);
  }, [adjustCurrent]);

  const handleChargeChange = useCallback(
    async (nextCharging: boolean) => {
      const previousCharging = isChargingRef.current;

      if (!topics || !mqtt.isConnected || isPublishingCommand) {
        setSwipePosition(previousCharging ? maxSwipeDistance : 0);
        return;
      }

      setCommandFeedback('');
      setCommandFeedbackIsError(false);
      setIsPublishingCommand(true);

      try {
        await publish(
          nextCharging ? topics.publish.remoteStart : topics.publish.remoteStop,
          nextCharging ? mqttPayloads.remoteStart() : mqttPayloads.remoteStop(),
        );
        setIsCharging(nextCharging);
        setCommandFeedback(
          nextCharging
            ? 'Charging start request sent.'
            : 'Charging stop request sent.',
        );
      } catch (error) {
        console.warn(
          '[Dashboard MQTT] charging command failed',
          getMqttErrorDetails(error),
        );
        setIsCharging(previousCharging);
        setSwipePosition(previousCharging ? maxSwipeDistance : 0);
        setCommandFeedbackIsError(true);
        setCommandFeedback(getMqttUserMessage(error));
      } finally {
        setIsPublishingCommand(false);
      }
    },
    [isPublishingCommand, maxSwipeDistance, mqtt.isConnected, publish, topics],
  );

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(mqtt.isConnected && !isPublishingCommand)
        .activeOffsetX([-4, 4])
        .failOffsetY([-12, 12])
        .runOnJS(true)
        .onStart(() => {
          setIsSwiping(true);
          startSwipeRef.current = isChargingRef.current ? maxSwipeDistance : 0;
        })
        .onUpdate(event => {
          const nextPosition = Math.max(
            0,
            Math.min(
              maxSwipeDistance,
              startSwipeRef.current + event.translationX,
            ),
          );
          setSwipePosition(nextPosition);
        })
        .onEnd(event => {
          setIsSwiping(false);
          const threshold = maxSwipeDistance * 0.55;
          const canStart =
            !isChargingRef.current && event.translationX >= threshold;
          const canStop =
            isChargingRef.current && event.translationX <= -threshold;

          if (canStart) {
            handleChargeChange(true).catch(() => undefined);
          } else if (canStop) {
            handleChargeChange(false).catch(() => undefined);
          } else {
            setSwipePosition(isChargingRef.current ? maxSwipeDistance : 0);
          }
        })
        .onFinalize((_event, success) => {
          setIsSwiping(false);
          if (!success) {
            setSwipePosition(isChargingRef.current ? maxSwipeDistance : 0);
          }
        }),
    [
      handleChargeChange,
      isPublishingCommand,
      maxSwipeDistance,
      mqtt.isConnected,
    ],
  );

  const connectionError = !topics
    ? 'Select a charger to connect to live data.'
    : mqtt.status === 'error' && !mqtt.isInitializing
    ? mqtt.error ||
      'Unable to connect to the selected charger. Please try again.'
    : '';
  const connectionLabel = mqtt.isInitializing
    ? 'Connecting...'
    : mqtt.isConnected
    ? 'Connected'
    : mqtt.status === 'error'
    ? 'Connection failed'
    : 'Disconnected';

  return {
    styles,
    isCharging,
    isSwiping,
    swipePosition,
    swipeGesture,
    handleTrackLayout,
    handleAlertsPress,
    handleSettingsPress,
    handleRetry,
    currentControl: {
      value: currentSetting,
      minimum: MIN_CURRENT,
      maximum: MAX_CURRENT,
      isSetting: isSettingCurrent,
      canSet: Boolean(topics && mqtt.isConnected && !isSettingCurrent),
      handleDecrease: handleCurrentDecrease,
      handleIncrease: handleCurrentIncrease,
    },
    dashboard: {
      telemetry,
      phaseParameters,
      isConnected: mqtt.isConnected,
      isLoading: mqtt.isInitializing,
      connectionLabel,
      connectionError,
      chargerError,
      commandFeedback,
      commandFeedbackIsError,
      current:
        telemetry.setCurrent ??
        Math.max(
          telemetry.phases.R.current,
          telemetry.phases.Y.current,
          telemetry.phases.B.current,
        ),
      duration: formatDuration(sessionElapsedSeconds),
      hasFault: telemetry.activeFaults.length > 0 || Boolean(chargerError),
      isPublishing: isPublishingCommand,
      canControl: Boolean(topics && mqtt.isConnected && !isPublishingCommand),
    },
  };
};

export default useDashboard;
