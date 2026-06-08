import { routes } from '@routes';
import { useNavigation } from '@react-navigation/native';
import { LayoutChangeEvent, PanResponder } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDeviceDimensions } from '@hooks';
import useStyles from './styles';

export const useDashboard = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();
  const { moderateWidth } = useDeviceDimensions();

  const [isCharging, setIsCharging] = useState(false);
  const [swipePosition, setSwipePosition] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const isChargingRef = useRef(isCharging);
  const startSwipeRef = useRef(0);

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
    swipeLabel,
  };
};

export default useDashboard;
