import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';
import useSelectDevice from './useSelectDevice';

export const SelectDevice = () => {
  const { styles, states, handlers } = useSelectDevice();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Select Device" style={styles.heading} />

      {states.loading && states.devices.length === 0 ? (
        <ActivityIndicator size="large" color="#0BB2C3" style={styles.loader} />
      ) : states.devices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText
            centered
            style={styles.description}
            label={states.error || 'No devices registered yet.'}
          />
        </View>
      ) : (
        states.devices.map((device, index) => (
          <View
            key={String(device.id || device.device_id || index)}
            style={styles.deviceCard}
          >
            <AppText
              semibold
              style={styles.deviceName}
              label={device.name || 'Unnamed device'}
            />
            <AppText
              style={styles.deviceDetail}
              label={`Device ID: ${device.device_id || device.id || '-'}`}
            />
            <AppText
              style={styles.deviceDetail}
              label={`Location: ${device.location || '-'}`}
            />
          </View>
        ))
      )}

      <AppButton
        title="Refresh"
        loader={states.loading}
        disabled={states.loading}
        onPress={handlers.handleRefresh}
      />
    </AuthorisedScreen>
  );
};

export default SelectDevice;
