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
import { useDeviceDimensions, useDispatch, useSelector } from '@hooks';
import { clearLogoutResponse, logout } from '@store/slices/auth/logout';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [current, setCurrent] = useState(DEFAULT_CURRENT);
  const [currentControlWidth, setCurrentControlWidth] = useState(0);
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

  const updateCurrentFromPosition = useCallback(
    (positionX: number) => {
      const usableTrackWidth = currentTrackWidth - currentThumbSize;

      if (usableTrackWidth <= 0) {
        return;
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

      setCurrent(Math.max(MIN_CURRENT, Math.min(nextCurrent, MAX_CURRENT)));
    },
    [currentControlPadding, currentThumbSize, currentTrackWidth],
  );

  const handleCurrentControlLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      setCurrentControlWidth(nativeEvent.layout.width);
    },
    [],
  );

  const handleCurrentTap = useCallback(
    ({ nativeEvent }: GestureResponderEvent) => {
      updateCurrentFromPosition(nativeEvent.locationX);
    },
    [updateCurrentFromPosition],
  );

  const currentPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 2,
        onPanResponderMove: event => {
          updateCurrentFromPosition(event.nativeEvent.locationX);
        },
      }),
    [updateCurrentFromPosition],
  );

  const handleCurrentAccessibilityAction = useCallback(
    ({ nativeEvent }: AccessibilityActionEvent) => {
      if (nativeEvent.actionName === 'increment') {
        setCurrent(value => Math.min(value + 1, MAX_CURRENT));
      } else if (nativeEvent.actionName === 'decrement') {
        setCurrent(value => Math.max(value - 1, MIN_CURRENT));
      }
    },
    [],
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
    },
  };
};

export default useSettings;
