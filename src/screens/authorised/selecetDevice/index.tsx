import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppButton, AppText } from '@components';
import type { Device } from '@store/slices/devices/devices';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';
import useSelectDevice from './useSelectDevice';

const getDeviceKey = (device: Device) =>
  String(device.device_id || device.id || '');

const SelectedDeviceDot = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Defs>
      <LinearGradient id="selectedDeviceDot" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#3AC34B" />
        <Stop offset="1" stopColor="#0BB2C3" />
      </LinearGradient>
    </Defs>
    <Circle cx="9" cy="9" r="8" fill="url(#selectedDeviceDot)" />
  </Svg>
);

export const SelectDevice = () => {
  const { styles, states, handlers } = useSelectDevice();
  const selectedDeviceKey = states.selectedDevice
    ? getDeviceKey(states.selectedDevice)
    : '';
  const isEmpty =
    !states.loading && !states.error && states.devices.length === 0;

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
                style={styles.deviceDetail}
                label={`Device ID: ${device.device_id || device.id || '-'}`}
              />
              <AppText
                style={styles.deviceDetail}
                label={`Location: ${device.location || '-'}`}
              />
            </View>

            {Boolean(selectedDeviceKey) &&
            selectedDeviceKey === getDeviceKey(device) ? (
              <View style={styles.selectedDot}>
                <SelectedDeviceDot />
              </View>
            ) : null}
          </Pressable>
        ))
      )}

      <View style={styles.actionsContainer}>
        <View style={isEmpty ? styles.buttonRow : undefined}>
          <AppButton
            title="Refresh"
            loader={states.loading}
            disabled={states.loading}
            onPress={handlers.handleRefresh}
            style={isEmpty ? styles.halfButton : undefined}
          />

          {isEmpty ? (
            <AppButton
              title="Add Device"
              onPress={handlers.handleAddDevice}
              style={styles.halfButton}
            />
          ) : null}
        </View>

        {states.requiresInitialSelection && states.selectedDevice ? (
          <AppButton title="Next" onPress={handlers.handleNext} />
        ) : null}
      </View>
    </AuthorisedScreen>
  );
};

export default SelectDevice;
