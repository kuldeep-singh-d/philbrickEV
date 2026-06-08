import { routes } from '@routes';
import { show } from '@utils/helpers';
import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';

import useStyles from './styles';

export const useSettings = () => {
  const styles = useStyles();
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

  const options = useMemo(
    () => [
      { title: 'Add Device', onPress: handleAddDevice },
      { title: 'Select Device', onPress: handleSelectDevice },
      { title: 'Update Password', onPress: handleUpdatePassword },
      { title: 'Device Firmware update', onPress: handleFirmwareUpdate },
    ],
    [
      handleAddDevice,
      handleFirmwareUpdate,
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
