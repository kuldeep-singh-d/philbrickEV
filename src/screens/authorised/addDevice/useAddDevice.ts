import { useCallback, useState } from 'react';

import { show } from '@utils/helpers';

import useStyles from './styles';

export const useAddDevice = () => {
  const styles = useStyles();

  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceIdError, setDeviceIdError] = useState('');
  const [deviceNameError, setDeviceNameError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDevice = useCallback(() => {
    const normalizedDeviceId = deviceId.trim();
    const normalizedDeviceName = deviceName.trim();
    let valid = true;

    if (!normalizedDeviceId) {
      setDeviceIdError('Device ID is required');
      valid = false;
    } else if (!/^[A-Za-z0-9-]{6,32}$/.test(normalizedDeviceId)) {
      setDeviceIdError('Use 6-32 letters, numbers, or dash');
      valid = false;
    }

    if (!normalizedDeviceName) {
      setDeviceNameError('Device name is required');
      valid = false;
    } else if (normalizedDeviceName.length < 3) {
      setDeviceNameError('Device name must be at least 3 characters');
      valid = false;
    }

    if (!valid || loading) {
      return;
    }

    setLoading(true);

    // Future API integration can submit this payload.
    const payload = {
      deviceId: normalizedDeviceId,
      deviceName: normalizedDeviceName,
    };

    setLoading(false);
    show.success(`${payload.deviceName} added locally.`);
  }, [deviceId, deviceName, loading]);

  return {
    styles,
    states: {
      deviceId,
      deviceName,
      deviceIdError,
      deviceNameError,
      loading,
    },
    handlers: {
      setDeviceId,
      setDeviceName,
      setDeviceIdError,
      setDeviceNameError,
      handleAddDevice,
    },
  };
};

export default useAddDevice;
