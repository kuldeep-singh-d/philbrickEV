import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { routes } from '@routes';
import { useDispatch, useSelector } from '@hooks';
import type { Device } from '@store/slices/devices/devices';
import { fetchDevices, selectDevices } from '@store/slices/devices/devices';
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
  const devices = selectDevices(devicesResponse.data);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDevices());
    }, [dispatch]),
  );

  const handleRefresh = useCallback(() => {
    if (!devicesResponse.loading) {
      dispatch(fetchDevices());
    }
  }, [devicesResponse.loading, dispatch]);

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
      navigation.replace(routes.app.dashboard);
    }
  }, [navigation, selectedDevice]);

  return {
    styles,
    states: {
      devices,
      selectedDevice,
      requiresInitialSelection,
      loading: Boolean(devicesResponse.loading),
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
