import { routes } from '@routes';
import { show } from '@utils/helpers';
import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useDispatch } from '@hooks';
import { clearLoginRes } from '@store/slices/auth/login';
import { setLoginState } from '@store/slices/localStates/loginState';
import useStyles from './styles';

export const useSettings = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();

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
      await AsyncStorage.clear();
    } catch {
      show.error('Unable to clear all stored data.');
    } finally {
      dispatch(setLoginState(false));
    }
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          handleConfirmedLogout();
        },
      },
    ]);
  }, [handleConfirmedLogout]);

  const options = useMemo(
    () => [
      { title: 'Add Device', onPress: handleAddDevice },
      { title: 'Select Device', onPress: handleSelectDevice },
      { title: 'Update Password', onPress: handleUpdatePassword },
      { title: 'Device Firmware update', onPress: handleFirmwareUpdate },
      { title: 'Logout', onPress: handleLogout },
    ],
    [
      handleAddDevice,
      handleFirmwareUpdate,
      handleLogout,
      handleSelectDevice,
      handleUpdatePassword,
    ],
  );

  return {
    styles,
    options,
  };
};

export default useSettings;
