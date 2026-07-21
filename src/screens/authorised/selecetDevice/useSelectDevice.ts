import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { routes } from '@routes';
import { useDispatch, useSelector } from '@hooks';
import type { Device } from '@store/slices/devices/devices';
import {
  fetchDevices,
  isDeviceListCacheStale,
  selectDevices,
} from '@store/slices/devices/devices';
import { setSelectedDevice } from '@store/slices/devices/selectedDevice';
import { getApiErrorMessage } from '@utils/apiError';

import useStyles from './styles';

export const shouldFetchDeviceListOnFocus = ({
  loading,
  lastFetchedAt,
  now = Date.now(),
}: {
  loading: boolean;
  lastFetchedAt?: number;
  now?: number;
}) => !loading && isDeviceListCacheStale(lastFetchedAt, now);

export const useSelectDevice = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const devicesResponse = useSelector(state => state.devices);
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const [requiresInitialSelection] = useState(() => !selectedDevice);
  const [refreshing, setRefreshing] = useState(false);
  const devices = selectDevices(devicesResponse.data);
  const devicesLoadingRef = useRef(devicesResponse.loading);

  useEffect(() => {
    devicesLoadingRef.current = devicesResponse.loading;
  }, [devicesResponse.loading]);

  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = shouldFetchDeviceListOnFocus({
        loading: devicesLoadingRef.current,
        lastFetchedAt: devicesResponse.lastFetchedAt,
      });

      if (shouldRefresh) {
        dispatch(fetchDevices());
      }
    }, [devicesResponse.lastFetchedAt, dispatch]),
  );

  const handleRefresh = useCallback(() => {
    if (!devicesResponse.loading) {
      setRefreshing(true);
      dispatch(fetchDevices());
    }
  }, [devicesResponse.loading, dispatch]);

  useEffect(() => {
    if (refreshing && !devicesResponse.loading) {
      setRefreshing(false);
    }
  }, [devicesResponse.loading, refreshing]);

  const handleSelectDevice = useCallback(
    (device: Device) => {
      dispatch(setSelectedDevice(device));
    },
    [dispatch],
  );

  const handleAddDevice = useCallback(() => {
    navigation.navigate(routes.app.addDevice);
  }, [navigation]);

  const handleDeleteDevice = useCallback((device: Device) => {
    const deviceName = device.name || 'this device';
    const deviceId = device.device_id || device.deviceId || device.id || '-';

    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${deviceName}?\nDevice ID: ${deviceId}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete API call once backend endpoint is ready.
            console.log('Delete device:', device);
          },
        },
      ],
    );
  }, []);

  const handleNext = useCallback(() => {
    if (selectedDevice) {
      navigation.replace(routes.app.mainTabs);
    }
  }, [navigation, selectedDevice]);

  return {
    styles,
    states: {
      devices,
      selectedDevice,
      requiresInitialSelection,
      loading: Boolean(devicesResponse.loading && devices.length === 0),
      refreshing,
      error: devicesResponse.error
        ? getApiErrorMessage(devicesResponse.error, 'Unable to load devices.')
        : '',
    },
    handlers: {
      handleRefresh,
      handleSelectDevice,
      handleDeleteDevice,
      handleAddDevice,
      handleNext,
    },
  };
};

export default useSelectDevice;
