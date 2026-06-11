import { routes } from '@routes';
import { useNavigation } from '@react-navigation/native';
import { LayoutChangeEvent, PanResponder } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDeviceDimensions, useMqtt, useSelector } from '@hooks';
import { selectDeviceMqttTopic } from '@store/slices/devices/devices';
import { requestNotificationPermissionAndToken } from '../../../services/handleNotification';
import useStyles from './styles';

const START_TEST_PAYLOAD = JSON.stringify({ Start: 1 });

export const useDashboard = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();
  const { moderateWidth } = useDeviceDimensions();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const selectedDeviceTopic = selectDeviceMqttTopic(selectedDevice);
  const mqtt = useMqtt({
    autoConnect: Boolean(selectedDeviceTopic),
    autoSubscribeTopic: selectedDeviceTopic || undefined,
  });
  const { publish } = mqtt;

  const [isCharging, setIsCharging] = useState(false);
  const [swipePosition, setSwipePosition] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isPublishingTest, setIsPublishingTest] = useState(false);
  const [publishResult, setPublishResult] = useState('');

  const isChargingRef = useRef(isCharging);
  const startSwipeRef = useRef(0);

  useEffect(() => {
    requestNotificationPermissionAndToken();
  }, []);

  useEffect(() => {
    isChargingRef.current = isCharging;
  }, [isCharging]);

  const handleWidth = moderateWidth(16);

  const maxSwipeDistance = useMemo(
    () => Math.max(0, trackWidth - handleWidth),
    [trackWidth, handleWidth],
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

  const handleSendStartTest = useCallback(async () => {
    if (!selectedDeviceTopic || isPublishingTest) {
      return;
    }

    setIsPublishingTest(true);
    setPublishResult('');

    try {
      await publish(selectedDeviceTopic, START_TEST_PAYLOAD);
      setPublishResult(`Sent ${START_TEST_PAYLOAD}`);
    } catch (error) {
      setPublishResult(
        error instanceof Error ? error.message : 'Unable to publish test data.',
      );
    } finally {
      setIsPublishingTest(false);
    }
  }, [isPublishingTest, publish, selectedDeviceTopic]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 4,
        onPanResponderGrant: () => {
          startSwipeRef.current = isChargingRef.current ? maxSwipeDistance : 0;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextPosition = Math.max(
            0,
            Math.min(maxSwipeDistance, startSwipeRef.current + gestureState.dx),
          );
          setSwipePosition(nextPosition);
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = maxSwipeDistance * 0.55;
          const canStart =
            !isChargingRef.current && gestureState.dx >= threshold;
          const canStop =
            isChargingRef.current && gestureState.dx <= -threshold;

          if (canStart) {
            setIsCharging(true);
          } else if (canStop) {
            setIsCharging(false);
          } else {
            setSwipePosition(isChargingRef.current ? maxSwipeDistance : 0);
          }
        },
        onPanResponderTerminate: () => {
          setSwipePosition(isChargingRef.current ? maxSwipeDistance : 0);
        },
      }),
    [maxSwipeDistance],
  );

  const swipeLabel = isCharging
    ? 'Swipe to Stop Charge'
    : 'Swipe to Start Charge';

  return {
    styles,
    isCharging,
    swipePosition,
    panResponder,
    handleTrackLayout,
    handleAlertsPress,
    handleSettingsPress,
    handleSendStartTest,
    swipeLabel,
    mqttTest: {
      deviceName: selectedDevice?.name || selectedDeviceTopic || 'No device',
      deviceTopic: selectedDeviceTopic || 'Not available',
      connectionStatus: mqtt.status,
      latestMessage: mqtt.latestMessage,
      error: mqtt.error,
      isPublishing: isPublishingTest,
      publishResult,
      canPublish: Boolean(selectedDeviceTopic && mqtt.isConnected),
      payload: START_TEST_PAYLOAD,
    },
  };
};

export default useDashboard;
