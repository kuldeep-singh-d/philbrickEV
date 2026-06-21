import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';

import { AppButton, AppText } from '@components';
import type { Device } from '@store/slices/devices/devices';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';
import useSelectDevice from './useSelectDevice';

const getDeviceKey = (device: Device) =>
  String(device.device_id || device.id || '');

export const SelectDevice = () => {
  const { styles, states, handlers } = useSelectDevice();
  const selectedDeviceKey = states.selectedDevice
    ? getDeviceKey(states.selectedDevice)
    : '';
  const isEmpty =
    !states.loading && !states.error && states.devices.length === 0;

  return (
    <AuthorisedScreen
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          tintColor="#31C44C"
          refreshing={states.refreshing}
          colors={['#31C44C', '#0BB2C3']}
          onRefresh={handlers.handleRefresh}
        />
      }
    >
      {/* <AppText semibold label="Select Device" style={styles.heading} /> */}

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
          <Pressable
            key={String(device.id || device.device_id || index)}
            accessibilityRole="button"
            accessibilityState={{
              selected:
                Boolean(selectedDeviceKey) &&
                selectedDeviceKey === getDeviceKey(device),
            }}
            onPress={() => handlers.handleSelectDevice(device)}
            style={({ pressed }) => [
              styles.deviceCard,
              Boolean(selectedDeviceKey) &&
                selectedDeviceKey === getDeviceKey(device) &&
                styles.selectedDeviceCard,
              pressed && styles.pressedDeviceCard,
            ]}
          >
            <View style={styles.deviceInfo}>
              <AppText
                semibold
                style={styles.deviceName}
                label={device.name || 'Unnamed device'}
              />
              <AppText
                medium
                style={styles.deviceDetail}
                label={`Device ID: ${device.device_id || device.id || '-'}`}
              />
              <AppText
                medium
                style={styles.deviceDetail}
                label={`Location: ${device.location || '-'}`}
              />
            </View>

            {Boolean(selectedDeviceKey) &&
            selectedDeviceKey === getDeviceKey(device) ? (
              <View style={styles.activeBadge}>
                <AppText
                  semibold
                  label="Active"
                  style={styles.activeBadgeText}
                />
              </View>
            ) : null}
          </Pressable>
        ))
      )}

      <View style={styles.actionsContainer}>
        {isEmpty ? (
          <AppButton title="Add Device" onPress={handlers.handleAddDevice} />
        ) : null}

        {states.requiresInitialSelection && states.selectedDevice ? (
          <AppButton title="Next" onPress={handlers.handleNext} />
        ) : null}
      </View>
    </AuthorisedScreen>
  );
};

export default SelectDevice;
