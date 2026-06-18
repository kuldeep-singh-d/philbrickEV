import {
  Alert,
  PanResponder,
  LayoutChangeEvent,
  GestureResponderEvent,
  AccessibilityActionEvent,
} from 'react-native';

import { routes } from '@routes';
import useStyles from './styles';
import { show } from '@utils/helpers';
import { clearUserStorage } from '@utils/mobileDevice';
import { useNavigation } from '@react-navigation/native';
import { clearLoginRes } from '@store/slices/auth/login';
import { setLoginState } from '@store/slices/localStates/loginState';
import { useDeviceDimensions, useDispatch, useMqtt, useSelector } from '@hooks';
import { clearLogoutResponse, logout } from '@store/slices/auth/logout';
import { selectDeviceMqttTopic } from '@store/slices/devices/devices';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getMqttErrorDetails,
  getMqttUserMessage,
} from '../../../mqtt/mqttClient';
import { createDeviceMqttTopics, mqttPayloads } from '../../../mqtt/mqttTopics';

const MIN_CURRENT = 1;
const MAX_CURRENT = 32;
const DEFAULT_CURRENT = 16;

export const useSettings = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { moderateHeight, moderateWidth } = useDeviceDimensions();
  const logoutRequestRef = useRef(false);
  const logoutResponse = useSelector(state => state.logout);
  const loginResponse = useSelector(state => state.login);
  const registerResponse = useSelector(state => state.register);
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const selectedDeviceId = selectDeviceMqttTopic(selectedDevice);
  const topics = useMemo(
    () => createDeviceMqttTopics(selectedDeviceId),
    [selectedDeviceId],
  );
  const {
    error: mqttError,
    isConnected: isMqttConnected,
    isInitializing: isMqttInitializing,
    publish,
    retry,
  } = useMqtt({
    autoConnect: Boolean(topics),
    autoRetryCount: 2,
  });
  const [current, setCurrent] = useState(DEFAULT_CURRENT);
  const [currentControlWidth, setCurrentControlWidth] = useState(0);
  const [isSettingCurrent, setIsSettingCurrent] = useState(false);
  const currentRef = useRef(DEFAULT_CURRENT);
  const isAdjustingCurrentRef = useRef(false);
  const currentControlPadding = moderateWidth(5);
  const currentThumbSize = moderateHeight(1.5);
  const currentTrackWidth = Math.max(
    currentControlWidth - currentControlPadding * 2,
    0,
  );
  const currentProgress = (current - MIN_CURRENT) / (MAX_CURRENT - MIN_CURRENT);
  const currentThumbPosition =
    currentProgress * Math.max(currentTrackWidth - currentThumbSize, 0);
  const customer =
    loginResponse.data?.data?.customer ||
    registerResponse.data?.data?.customer ||
    {};

  const setCurrentValue = useCallback((nextCurrent: number) => {
    const normalizedCurrent = Math.max(
      MIN_CURRENT,
      Math.min(nextCurrent, MAX_CURRENT),
    );
    currentRef.current = normalizedCurrent;
    setCurrent(normalizedCurrent);
    return normalizedCurrent;
  }, []);

  const publishCurrent = useCallback(
    async (nextCurrent: number) => {
      if (!topics) {
        show.warn('Select a charger before setting the current.');
        return;
      }

      if (!isMqttConnected) {
        show.warn('The charger is not connected yet. Please try again.');
        retry();
        return;
      }

      if (isSettingCurrent) {
        return;
      }

      setIsSettingCurrent(true);

      try {
        await publish(
          topics.publish.setCurrent,
          mqttPayloads.setCurrent(nextCurrent),
        );
        show.success(`Charging current set to ${nextCurrent} A.`);
      } catch (error) {
        console.warn(
          '[Settings MQTT] set current publish failed',
          getMqttErrorDetails(error),
        );
        show.error(getMqttUserMessage(error));
      } finally {
        setIsSettingCurrent(false);
      }
    },
    [isMqttConnected, isSettingCurrent, publish, retry, topics],
  );

  const updateCurrentFromPosition = useCallback(
    (positionX: number) => {
      const usableTrackWidth = currentTrackWidth - currentThumbSize;

      if (usableTrackWidth <= 0) {
        return undefined;
      }

      const trackStart = currentControlPadding + currentThumbSize / 2;
      const clampedPosition = Math.max(
        0,
        Math.min(positionX - trackStart, usableTrackWidth),
      );
      const nextCurrent = Math.round(
        MIN_CURRENT +
          (clampedPosition / usableTrackWidth) * (MAX_CURRENT - MIN_CURRENT),
      );

      return setCurrentValue(nextCurrent);
    },
    [
      currentControlPadding,
      currentThumbSize,
      currentTrackWidth,
      setCurrentValue,
    ],
  );

  const handleCurrentControlLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      setCurrentControlWidth(nativeEvent.layout.width);
    },
    [],
  );

  const handleCurrentTap = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      if (isAdjustingCurrentRef.current) {
        return;
      }

      const nextCurrent = updateCurrentFromPosition(nativeEvent.locationX);

      if (nextCurrent !== undefined) {
        publishCurrent(nextCurrent).catch(() => undefined);
      }
    },
    [publishCurrent, updateCurrentFromPosition],
  );

  const currentPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isMqttConnected &&
          !isSettingCurrent &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 2,
        onPanResponderGrant: () => {
          isAdjustingCurrentRef.current = true;
        },
        onPanResponderMove: event => {
          updateCurrentFromPosition(event.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
          publishCurrent(currentRef.current)
            .catch(() => undefined)
            .finally(() => {
              isAdjustingCurrentRef.current = false;
            });
        },
        onPanResponderTerminate: () => {
          isAdjustingCurrentRef.current = false;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [
      isSettingCurrent,
      isMqttConnected,
      publishCurrent,
      updateCurrentFromPosition,
    ],
  );

  const handleCurrentAccessibilityAction = useCallback(
    ({ nativeEvent }: AccessibilityActionEvent) => {
      let nextCurrent = currentRef.current;

      if (nativeEvent.actionName === 'increment') {
        nextCurrent = setCurrentValue(currentRef.current + 1);
      } else if (nativeEvent.actionName === 'decrement') {
        nextCurrent = setCurrentValue(currentRef.current - 1);
      } else {
        return;
      }

      publishCurrent(nextCurrent).catch(() => undefined);
    },
    [publishCurrent, setCurrentValue],
  );

  const profile = useMemo(() => {
    const name = customer.name?.trim() || customer.username?.trim() || 'User';
    const initials =
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part.charAt(0).toUpperCase())
        .join('') || 'U';

    return {
      name,
      initials,
      username: customer.username?.trim() || '',
      email: customer.email?.trim() || '',
      phone: customer.phone?.trim() || '',
    };
  }, [customer.email, customer.name, customer.phone, customer.username]);

  const handleAddDevice = useCallback(() => {
    navigation.navigate(routes.app.addDevice);
  }, [navigation]);

  const handleSelectDevice = useCallback(() => {
    navigation.navigate(routes.app.selectDevice);
  }, [navigation]);

  const handleUpdatePassword = useCallback(() => {
    navigation.navigate(routes.app.updatePassword);
  }, [navigation]);

  const handleFirmwareUpdate = useCallback(() => {
    show.warn('Device firmware update will be available soon.');
  }, []);

  const handleConfirmedLogout = useCallback(async () => {
    dispatch(clearLoginRes());

    try {
      await clearUserStorage();
    } catch {
      show.error('Unable to clear all stored data.');
    } finally {
      dispatch(setLoginState(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!logoutRequestRef.current || logoutResponse.data === undefined) {
      return;
    }

    logoutRequestRef.current = false;
    handleConfirmedLogout();
  }, [handleConfirmedLogout, logoutResponse.data]);

  useEffect(() => {
    if (!logoutRequestRef.current || !logoutResponse.error) {
      return;
    }

    logoutRequestRef.current = false;
  }, [logoutResponse.error]);

  const handleLogout = useCallback(() => {
    if (logoutResponse.loading || logoutRequestRef.current) {
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          logoutRequestRef.current = true;
          dispatch(clearLogoutResponse());
          dispatch(logout());
        },
      },
    ]);
  }, [dispatch, logoutResponse.loading]);

  const options = useMemo(
    () => [
      { title: 'Add Device', onPress: handleAddDevice },
      { title: 'Select Device', onPress: handleSelectDevice },
      { title: 'Update Password', onPress: handleUpdatePassword },
      { title: 'Device Firmware update', onPress: handleFirmwareUpdate },
      {
        title: 'Logout',
        onPress: handleLogout,
        loader: Boolean(logoutResponse.loading),
        disabled: Boolean(logoutResponse.loading),
      },
    ],
    [
      handleAddDevice,
      handleFirmwareUpdate,
      handleLogout,
      handleSelectDevice,
      handleUpdatePassword,
      logoutResponse.loading,
    ],
  );

  return {
    styles,
    options,
    profile,
    currentControl: {
      value: current,
      minimum: MIN_CURRENT,
      maximum: MAX_CURRENT,
      fillWidth:
        currentTrackWidth > 0 ? currentThumbPosition + currentThumbSize / 2 : 0,
      thumbPosition: currentThumbPosition,
      panHandlers: currentPanResponder.panHandlers,
      handleLayout: handleCurrentControlLayout,
      handleTap: handleCurrentTap,
      handleAccessibilityAction: handleCurrentAccessibilityAction,
      isSetting: isSettingCurrent,
      canSet: Boolean(topics && isMqttConnected && !isSettingCurrent),
      statusMessage: isMqttInitializing
        ? 'Connecting to charger...'
        : mqttError
        ? 'Unable to connect to the charger.'
        : '',
      statusIsError: Boolean(mqttError && !isMqttInitializing),
    },
  };
};

export default useSettings;
