import { useCallback, useEffect, useRef, useState } from 'react';
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
      const hasCachedDevices = devices.length > 0;
      const shouldRefresh =
        !devicesLoadingRef.current &&
        (!hasCachedDevices ||
          isDeviceListCacheStale(devicesResponse.lastFetchedAt));

      if (shouldRefresh) {
        dispatch(fetchDevices());
      }
    }, [devices.length, devicesResponse.lastFetchedAt, dispatch]),
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
      handleAddDevice,
      handleNext,
    },
  };
};

export default useSelectDevice;
