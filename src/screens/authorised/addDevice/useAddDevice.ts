import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { show } from '@utils/helpers';
import { routes } from '@routes';
import { useDispatch, useSelector } from '@hooks';
import { getApiFieldError } from '@utils/apiError';
import {
  clearCreateDeviceResponse,
  createDevice,
} from '@store/slices/devices/createDevice';
import { fetchDevices } from '@store/slices/devices/devices';

import useStyles from './styles';

export const useAddDevice = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const requestRef = useRef(false);
  const createDeviceResponse = useSelector(state => state.createDevice);

  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [deviceIdError, setDeviceIdError] = useState('');
  const [deviceNameError, setDeviceNameError] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!requestRef.current || !createDeviceResponse.data) {
      return;
    }

    requestRef.current = false;
    show.success(
      createDeviceResponse.data?.message || 'Device registered successfully.',
    );
    dispatch(fetchDevices());
    dispatch(clearCreateDeviceResponse());
    navigation.navigate(routes.app.selectDevice);
  }, [createDeviceResponse.data, dispatch, navigation]);

  useEffect(() => {
    if (!requestRef.current || !createDeviceResponse.error) {
      return;
    }

    requestRef.current = false;
    setDeviceIdError(
      getApiFieldError(createDeviceResponse.error, 'device_id'),
    );
    setDeviceNameError(getApiFieldError(createDeviceResponse.error, 'name'));
    setLocationError(getApiFieldError(createDeviceResponse.error, 'location'));
  }, [createDeviceResponse.error]);

  useEffect(
    () => () => {
      dispatch(clearCreateDeviceResponse());
    },
    [dispatch],
  );

  const handleAddDevice = useCallback(() => {
    const normalizedDeviceId = deviceId.trim();
    const normalizedDeviceName = deviceName.trim();
    const normalizedLocation = location.trim();
    let valid = true;

    if (!normalizedDeviceId) {
      setDeviceIdError('Device ID is required');
      valid = false;
    } else if (!/^[A-Za-z0-9_-]+$/.test(normalizedDeviceId)) {
      setDeviceIdError('Use letters, numbers, dash, or underscore');
      valid = false;
    }

    if (!normalizedDeviceName) {
      setDeviceNameError('Device name is required');
      valid = false;
    } else if (normalizedDeviceName.length < 3) {
      setDeviceNameError('Device name must be at least 3 characters');
      valid = false;
    }

    if (!normalizedLocation) {
      setLocationError('Location is required');
      valid = false;
    }

    if (!valid || createDeviceResponse.loading || requestRef.current) {
      return;
    }

    requestRef.current = true;
    dispatch(clearCreateDeviceResponse());
    dispatch(
      createDevice({
        device_id: normalizedDeviceId,
        name: normalizedDeviceName,
        location: normalizedLocation,
      }),
    );
  }, [
    createDeviceResponse.loading,
    deviceId,
    deviceName,
    dispatch,
    location,
  ]);

  return {
    styles,
    states: {
      deviceId,
      deviceName,
      location,
      deviceIdError,
      deviceNameError,
      locationError,
      loading: Boolean(createDeviceResponse.loading),
    },
    handlers: {
      setDeviceId,
      setDeviceName,
      setLocation,
      setDeviceIdError,
      setDeviceNameError,
      setLocationError,
      handleAddDevice,
    },
  };
};

export default useAddDevice;
