import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useDispatch, useSelector } from '@hooks';
import { fetchDevices, selectDevices } from '@store/slices/devices/devices';
import { getApiErrorMessage } from '@utils/apiError';

import useStyles from './styles';

export const useSelectDevice = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const devicesResponse = useSelector(state => state.devices);
  console.log('\n ~ useSelectDevice ~ devicesResponse:', devicesResponse);
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

  return {
    styles,
    states: {
      devices,
      loading: Boolean(devicesResponse.loading),
      error: devicesResponse.error
        ? getApiErrorMessage(devicesResponse.error, 'Unable to load devices.')
        : '',
    },
    handlers: {
      handleRefresh,
    },
  };
};

export default useSelectDevice;
