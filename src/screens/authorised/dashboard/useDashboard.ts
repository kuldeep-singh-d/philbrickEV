import { routes } from '@routes';
import { useNavigation } from '@react-navigation/native';
import { AppState, LayoutChangeEvent, type AppStateStatus } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDeviceDimensions, useMqtt, useSelector } from '@hooks';
import { selectDeviceMqttTopic } from '@store/slices/devices/devices';
import {
  getMqttErrorDetails,
  getMqttUserMessage,
} from '../../../mqtt/mqttClient';
import { createDeviceMqttTopics, mqttPayloads } from '../../../mqtt/mqttTopics';
import { parseDashboardMessage } from './dashboardData';
import useStyles from './styles';

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

export const useDashboard = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();
  const { moderateWidth } = useDeviceDimensions();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const selectedDeviceId = selectDeviceMqttTopic(selectedDevice);
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
  const [isCharging, setIsCharging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipePosition, setSwipePosition] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isPublishingCommand, setIsPublishingCommand] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState('');
  const [commandFeedbackIsError, setCommandFeedbackIsError] = useState(false);
  const [chargerError, setChargerError] = useState('');

  const isChargingRef = useRef(isCharging);
  const startSwipeRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const requestedDeviceRef = useRef('');

  const telemetry = useMemo(
    () =>
      parseDashboardMessage(
        statusMessage,
        selectedDevice as Record<string, unknown> | null,
      ),
    [selectedDevice, statusMessage],
  );

  useEffect(() => {
    setStatusMessage(null);
    setCommandFeedback('');
    setCommandFeedbackIsError(false);
    setChargerError('');
    requestedDeviceRef.current = '';
  }, [selectedDeviceId]);

  useEffect(() => {
    const latestMessage = mqtt.latestMessage;

    if (!latestMessage || !topics) {
      return;
    }

    try {
      if (
        latestMessage.topic === topics.subscribe.status ||
        latestMessage.topic === topics.subscribe.legacyStatus
      ) {
        setStatusMessage(latestMessage.message);
        return;
      }

      if (latestMessage.topic === topics.subscribe.error) {
        setChargerError(
          getMessageText(
            latestMessage.message,
            'The charger reported an error.',
          ),
        );
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
    if (telemetry.cpStatus !== undefined) {
      setIsCharging(telemetry.cpStatus === 3);
    }
  }, [telemetry.cpStatus]);

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

  useEffect(() => {
    isChargingRef.current = isCharging;
  }, [isCharging]);

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

  const handleAlertsPress = useCallback(() => {
    navigation.navigate(routes.app.alerts);
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate(routes.app.settings);
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setCommandFeedback('');
    setCommandFeedbackIsError(false);
    setChargerError('');
    retry();
  }, [retry]);

  const handleChargeChange = useCallback(
    async (nextCharging: boolean) => {
      const previousCharging = isChargingRef.current;

      if (!topics || !mqtt.isConnected || isPublishingCommand) {
        setSwipePosition(previousCharging ? maxSwipeDistance : 0);
        return;
      }

      setIsCharging(nextCharging);
      setCommandFeedback('');
      setCommandFeedbackIsError(false);
      setIsPublishingCommand(true);

      try {
        await publish(
          nextCharging ? topics.publish.remoteStart : topics.publish.remoteStop,
          nextCharging ? mqttPayloads.remoteStart() : mqttPayloads.remoteStop(),
        );
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
    dashboard: {
      telemetry,
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
      hasFault: telemetry.activeFaults.length > 0 || Boolean(chargerError),
      isPublishing: isPublishingCommand,
      canControl: Boolean(topics && mqtt.isConnected && !isPublishingCommand),
    },
  };
};

export default useDashboard;
