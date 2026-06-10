import React from 'react';
import { useAddDevice } from './useAddDevice';
import { AppButton, AppInput, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const AddDevice = () => {
  const { styles, states, handlers } = useAddDevice();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Add new device" style={styles.heading} />

      <AppInput
        title="Device ID"
        gradientBorder
        returnKeyType="next"
        value={states.deviceId}
        placeholder="02314548664"
        error={states.deviceIdError}
        onChangeText={handlers.setDeviceId}
        setError={handlers.setDeviceIdError}
      />

      <AppInput
        gradientBorder
        title="Device Name"
        returnKeyType="next"
        autoCapitalize="words"
        value={states.deviceName}
        placeholder="Home Charger"
        error={states.deviceNameError}
        onChangeText={handlers.setDeviceName}
        setError={handlers.setDeviceNameError}
      />

      <AppInput
        gradientBorder
        title="Location"
        returnKeyType="done"
        autoCapitalize="words"
        value={states.location}
        placeholder="Garage"
        error={states.locationError}
        onChangeText={handlers.setLocation}
        setError={handlers.setLocationError}
        onSubmitEditing={handlers.handleAddDevice}
      />

      <AppButton
        title="Add"
        loader={states.loading}
        disabled={states.loading}
        // style={styles.addButton}
        onPress={handlers.handleAddDevice}
      />
    </AuthorisedScreen>
  );
};

export default AddDevice;
