import { routes } from '@routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AppState, LayoutChangeEvent, type AppStateStatus } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDeviceDimensions, useDispatch, useMqtt, useSelector } from '@hooks';
import { show } from '@utils/helpers';
import { getApiErrorMessage } from '@utils/apiError';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';
import { selectDeviceMqttTopic } from '@store/slices/devices/devices';
import { fetchCertificates } from '@store/slices/certificates/certificates';
import {
  getMqttErrorDetails,
  getMqttUserMessage,
} from '../../../mqtt/mqttClient';
import {
  createDeviceMqttTopics,
  mqttPayloads,
  type DeviceMqttTopics,
} from '../../../mqtt/mqttTopics';
import {
  FAULT_LABELS,
  getActiveFaults,
  getFirmwareVersions,
  isCpStatusChargingActive,
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
const CHARGER_DATA_TIMEOUT_MS = 8_000;
const LIVE_STATUS_PAYLOAD_KEYS = [
  'cp_stat',
  'cpStatus',
  'cp_status',
  'auth',
  'power',
  'temperature',
  'setcurrentfb',
  'setCurrent',
  'fault_status',
  'votlageR',
  'votlageY',
  'votlageB',
  'voltageR',
  'voltageY',
  'voltageB',
  'currentR',
  'currentY',
  'currentB',
] as const;
const RESPONSE_ID_PAYLOAD_KEYS = [
  'device1',
  'deviceId',
  'device_id',
  'evsecap',
  'swversion1',
  'swversion2',
  'mcuVersion',
  'wifiVersion',
  'mcu',
  'wifi',
  'votlageR',
  'votlageY',
  'votlageB',
  'voltageR',
  'voltageY',
  'voltageB',
  'currentR',
  'currentY',
  'currentB',
] as const;
const ERROR_PAYLOAD_KEYS = ['error', 'fault', 'fault_status'] as const;

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

const getDeviceText = (
  device: Record<string, unknown> | null,
  keys: string[],
) => {
  for (const key of keys) {
    const value = device?.[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

const parseJsonRecord = (message: string) => {
  try {
    const parsed = JSON.parse(message);

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const hasPayloadKey = (
  payload: Record<string, unknown>,
  keys: readonly string[],
) => keys.some(key => Object.prototype.hasOwnProperty.call(payload, key));

const isValidLiveChargerMessage = (
  topics: DeviceMqttTopics,
  topic: string,
  message: string,
) => {
  const payload = parseJsonRecord(message);

  if (!payload) {
    return false;
  }

  if (
    topic === topics.subscribe.status ||
    topic === topics.subscribe.legacyStatus
  ) {
    return hasPayloadKey(payload, LIVE_STATUS_PAYLOAD_KEYS);
  }

  if (topic === topics.subscribe.responseId) {
    return hasPayloadKey(payload, RESPONSE_ID_PAYLOAD_KEYS);
  }

  if (topic === topics.subscribe.error) {
    return hasPayloadKey(payload, ERROR_PAYLOAD_KEYS);
  }

  return false;
};

export const useDashboard = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const isFocused = useIsFocused();
  const { moderateWidth } = useDeviceDimensions();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const dynamicMqttConfig = useSelector(state => state.certificates.mqttConfig);
  const certificatesLoading = useSelector(state => state.certificates.loading);
  const certificatesError = useSelector(state => state.certificates.error);
  const mqttConfigError = useSelector(
    state => state.certificates.mqttConfigError,
  );
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
    config: dynamicMqttConfig,
    autoConnect: Boolean(topics && dynamicMqttConfig?.enabled),
    autoSubscribeTopics: subscriptionTopics,
    autoRetryCount: 2,
    disconnectOnUnmount: true,
  });
  const { disconnect, publish, retry } = mqtt;

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [responseIdMessage, setResponseIdMessage] = useState<string | null>(
    null,
  );

  console.log('\n ~ useDashboard ~ responseIdMessage:', responseIdMessage);

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
  const [connectionAlertVisible, setConnectionAlertVisible] = useState(false);
  const [connectionAlertRetrying, setConnectionAlertRetrying] = useState(false);

  const isChargingRef = useRef(isCharging);
  const currentSettingRef = useRef(DEFAULT_CURRENT);
  const isSettingCurrentRef = useRef(false);
  const startSwipeRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const requestedDeviceRef = useRef('');
  const sessionStartRef = useRef<string | null>(null);
  const activeTimerStartedAtMsRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastValidChargerMessageAtRef = useRef<number | null>(null);
  const connectionAlertRetrySawInitializingRef = useRef(false);

  const telemetry = useMemo(
    () =>
      parseDashboardMessage(
        statusMessage,
        selectedDevice as Record<string, unknown> | null,
      ),
    [selectedDevice, statusMessage],
  );
  console.log('\n ~ useDashboard ~ telemetry:', telemetry);
  const phaseParameters = useMemo(
    () => parsePhaseParametersMessage(responseIdMessage, telemetry.phases),
    [responseIdMessage, telemetry.phases],
  );
  const selectedDeviceInfo = useMemo(() => {
    const device = selectedDevice as Record<string, unknown> | null;

    return {
      name: getDeviceText(device, ['name']) || 'Selected device',
      id: getDeviceText(device, ['device_id', 'deviceId', 'id']),
      location: getDeviceText(device, ['location']),
      firmwareVersions: getFirmwareVersions(responseIdMessage),
    };
  }, [responseIdMessage, selectedDevice]);
  const isActiveChargingStatus = isCpStatusChargingActive(telemetry.cpStatus);

  const clearConnectionAlertTimer = useCallback(() => {
    if (connectionAlertTimerRef.current) {
      clearTimeout(connectionAlertTimerRef.current);
      connectionAlertTimerRef.current = null;
    }
  }, []);

  const startConnectionAlertTimer = useCallback(() => {
    clearConnectionAlertTimer();

    if (
      !topics ||
      !mqtt.isConnected ||
      mqtt.isInitializing ||
      !selectedDeviceId
    ) {
      return;
    }

    connectionAlertTimerRef.current = setTimeout(() => {
      const lastValidMessageAt = lastValidChargerMessageAtRef.current;
      const shouldShowAlert =
        lastValidMessageAt === null ||
        Date.now() - lastValidMessageAt >= CHARGER_DATA_TIMEOUT_MS;

      if (shouldShowAlert) {
        setConnectionAlertRetrying(false);
        setConnectionAlertVisible(true);
      }
    }, CHARGER_DATA_TIMEOUT_MS);
  }, [
    clearConnectionAlertTimer,
    mqtt.isConnected,
    mqtt.isInitializing,
    selectedDeviceId,
    topics,
  ]);

  const markConnectionAlertActivity = useCallback(() => {
    lastValidChargerMessageAtRef.current = Date.now();
    setConnectionAlertVisible(false);
    setConnectionAlertRetrying(false);
    connectionAlertRetrySawInitializingRef.current = false;
    startConnectionAlertTimer();
  }, [startConnectionAlertTimer]);

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
    lastValidChargerMessageAtRef.current = null;
    connectionAlertRetrySawInitializingRef.current = false;
    setConnectionAlertVisible(false);
    setConnectionAlertRetrying(false);
    clearConnectionAlertTimer();

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, [clearConnectionAlertTimer, selectedDeviceId, setCurrentValue]);

  useEffect(() => {
    if (!mqttConfigError) {
      return;
    }

    console.warn('[MQTT] dynamic config unavailable for dashboard', {
      error: mqttConfigError,
    });
    setCommandFeedbackIsError(true);
    setCommandFeedback(mqttConfigError);
  }, [mqttConfigError]);

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

      clearConnectionAlertTimer();
    },
    [clearConnectionAlertTimer],
  );

  useEffect(() => {
    if (
      !topics ||
      !selectedDeviceId ||
      !mqtt.isConnected ||
      mqtt.isInitializing
    ) {
      clearConnectionAlertTimer();
      lastValidChargerMessageAtRef.current = null;

      if (!mqtt.isInitializing) {
        setConnectionAlertVisible(false);
        setConnectionAlertRetrying(false);
        connectionAlertRetrySawInitializingRef.current = false;
      }

      return;
    }

    startConnectionAlertTimer();

    return clearConnectionAlertTimer;
  }, [
    clearConnectionAlertTimer,
    mqtt.isConnected,
    mqtt.isInitializing,
    selectedDeviceId,
    startConnectionAlertTimer,
    topics,
  ]);

  useEffect(() => {
    if (!connectionAlertRetrying) {
      return;
    }

    if (mqtt.isInitializing || mqtt.status === 'connecting') {
      connectionAlertRetrySawInitializingRef.current = true;
      return;
    }

    if (!connectionAlertRetrySawInitializingRef.current) {
      return;
    }

    connectionAlertRetrySawInitializingRef.current = false;
    setConnectionAlertRetrying(false);

    if (mqtt.isConnected) {
      setConnectionAlertVisible(false);
      lastValidChargerMessageAtRef.current = null;
      startConnectionAlertTimer();
    }
  }, [
    connectionAlertRetrying,
    mqtt.isConnected,
    mqtt.isInitializing,
    mqtt.status,
    startConnectionAlertTimer,
  ]);

  useEffect(() => {
    const latestMessage = mqtt.latestMessage;

    if (!latestMessage || !topics) {
      return;
    }

    const relevantTopics = [
      topics.subscribe.legacyStatus,
      topics.subscribe.responseId,
      topics.subscribe.status,
      topics.subscribe.error,
    ];
    const isRelevantLiveDataTopic = relevantTopics.includes(
      latestMessage.topic,
    );

    if (
      isRelevantLiveDataTopic &&
      !isValidLiveChargerMessage(
        topics,
        latestMessage.topic,
        latestMessage.message,
      )
    ) {
      console.warn('[Dashboard MQTT] invalid live charger payload ignored', {
        topic: latestMessage.topic,
      });
      return;
    }

    try {
      if (latestMessage.topic === topics.subscribe.responseId) {
        setResponseIdMessage(latestMessage.message);
        markConnectionAlertActivity();
        return;
      }

      if (
        latestMessage.topic === topics.subscribe.status ||
        latestMessage.topic === topics.subscribe.legacyStatus
      ) {
        setStatusMessage(latestMessage.message);
        markConnectionAlertActivity();
        return;
      }

      if (latestMessage.topic === topics.subscribe.error) {
        setChargerError(getChargerErrorText(latestMessage.message));
        markConnectionAlertActivity();
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
  }, [markConnectionAlertActivity, mqtt.latestMessage, publish, topics]);

  useEffect(() => {
    if (telemetry.cpStatus !== undefined) {
      setIsCharging(isActiveChargingStatus);
      return;
    }

    if (telemetry.auth !== undefined) {
      setIsCharging(telemetry.auth === 1);
    }
  }, [isActiveChargingStatus, telemetry.auth, telemetry.cpStatus]);

  useEffect(() => {
    if (!mqtt.isConnected) {
      requestedDeviceRef.current = '';
      return;
    }

    if (!topics) {
      return;
    }

    if (mqtt.subscribedTopics.includes(topics.subscribe.responseId)) {
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
  }, [
    mqtt.isConnected,
    mqtt.subscribedTopics,
    publish,
    topics,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'background') {
        clearConnectionAlertTimer();
        lastValidChargerMessageAtRef.current = null;
        connectionAlertRetrySawInitializingRef.current = false;
        setConnectionAlertVisible(false);
        setConnectionAlertRetrying(false);

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
  }, [clearConnectionAlertTimer, disconnect, retry]);

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

    const navigationState =
      navigation.getParent()?.getState() || navigation.getState();
    const activeRoute = navigationState.routes[navigationState.index];

    if (activeRoute?.name === routes.app.alerts) {
      navigation.navigate(routes.app.alerts, { alerts: activeAlerts });
    }
  }, [activeAlerts, isFocused, navigation]);

  const handleAlertsPress = useCallback(() => {
    navigation.navigate(routes.app.alerts, { alerts: activeAlerts });
  }, [activeAlerts, navigation]);

  const handleRetry = useCallback(() => {
    setCommandFeedback('');
    setCommandFeedbackIsError(false);
    setChargerError('');

    if (!dynamicMqttConfig && !certificatesLoading) {
      dispatch(fetchCertificates());
      return;
    }

    retry();
  }, [certificatesLoading, dispatch, dynamicMqttConfig, retry]);

  const handleConnectionAlertRetry = useCallback(() => {
    if (connectionAlertRetrying) {
      return;
    }

    clearConnectionAlertTimer();
    lastValidChargerMessageAtRef.current = null;
    connectionAlertRetrySawInitializingRef.current = false;
    setConnectionAlertVisible(true);
    setConnectionAlertRetrying(true);
    handleRetry();
  }, [clearConnectionAlertTimer, connectionAlertRetrying, handleRetry]);

  const adjustCurrent = useCallback(
    async (change: number) => {
      if (!topics) {
        show.warn('Select a charger before setting the current.');
        return;
      }

      if (!mqtt.isConnected) {
        show.warn('The charger is not connected yet. Please try again.');
        retry();
        return;
      }

      if (isSettingCurrentRef.current) {
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
        if (__DEV__) {
          console.log('[Dashboard MQTT] setting current', {
            current: nextCurrent,
          });
        }

        await publish(
          topics.publish.setCurrent,
          mqttPayloads.setCurrent(nextCurrent),
        );

        if (__DEV__) {
          console.log('[Dashboard MQTT] set current published', {
            current: nextCurrent,
          });
        }

        setCommandFeedback(`Charging current set to ${nextCurrent} A.`);
        // show.success(`Charging current set to ${nextCurrent} A.`);
      } catch (error) {
        const errorMessage = getMqttUserMessage(error);

        console.warn(
          '[Dashboard MQTT] set current publish failed',
          getMqttErrorDetails(error),
        );
        setCurrentValue(previousCurrent);
        setCommandFeedbackIsError(true);
        setCommandFeedback(errorMessage);
        show.error(errorMessage);
      } finally {
        isSettingCurrentRef.current = false;
        setIsSettingCurrent(false);
      }
    },
    [mqtt.isConnected, publish, retry, setCurrentValue, topics],
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

  const certificateConnectionError =
    !dynamicMqttConfig && certificatesError
      ? getApiErrorMessage(
          certificatesError,
          'Unable to load MQTT configuration. Please try again.',
        )
      : '';
  const connectionError = !topics
    ? 'Select a charger to connect to live data.'
    : certificateConnectionError
    ? certificateConnectionError
    : mqttConfigError
    ? mqttConfigError
    : mqtt.status === 'error' && !mqtt.isInitializing
    ? mqtt.error ||
      'Unable to connect to the selected charger. Please try again.'
    : '';
  const connectionLabel =
    certificatesLoading && !dynamicMqttConfig
      ? 'Preparing connection...'
      : mqtt.isInitializing
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
    handleChargeChange,
    handleTrackLayout,
    handleAlertsPress,
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
      selectedDeviceInfo,
      phaseParameters,
      isConnected: mqtt.isConnected,
      isLoading:
        mqtt.isInitializing || (certificatesLoading && !dynamicMqttConfig),
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
    connectionAlertVisible,
    connectionAlertRetrying,
    handleConnectionAlertRetry,
  };
};

export default useDashboard;
