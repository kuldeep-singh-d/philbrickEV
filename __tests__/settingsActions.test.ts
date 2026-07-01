import { createDevice } from '../src/store/slices/devices/createDevice';
import {
  fetchDevices,
  failed,
  selectDeviceMqttTopic,
  selectDevices,
} from '../src/store/slices/devices/devices';
import reducer from '../src/store/slices/devices/devices';
import { forgotPassword } from '../src/store/slices/auth/forgotPassword';
import { verifyOtp } from '../src/store/slices/auth/verifyOtp';
import { resetPassword } from '../src/store/slices/auth/resetPassword';

describe('settings API actions', () => {
  it('builds the documented device registration request', () => {
    const action = createDevice({
      device_id: 'DEV-001',
      name: 'Garage Charger',
      location: 'Garage',
    });

    expect(action.payload).toMatchObject({
      url: '/api/v1/devices',
      method: 'POST',
      isRowData: true,
      data: {
        device_id: 'DEV-001',
        name: 'Garage Charger',
        location: 'Garage',
      },
    });
  });

  it('builds the device list request', () => {
    expect(fetchDevices().payload).toMatchObject({
      url: '/api/v1/devices',
      method: 'GET',
    });
  });

  it('normalizes common wrapped device list responses', () => {
    const devices = [{ id: 1, device_id: 'DEV-001', name: 'Garage' }];

    expect(selectDevices({ data: devices })).toEqual(devices);
    expect(selectDevices({ data: { devices } })).toEqual(devices);
    expect(selectDevices({ data: { data: devices } })).toEqual(devices);
    expect(selectDevices({ data: { devices: { data: devices } } })).toEqual(
      devices,
    );
    expect(
      selectDevices({ data: { data: { devices: { data: devices } } } }),
    ).toEqual(devices);
    expect(selectDevices({ data: { chargers: { data: devices } } })).toEqual(
      devices,
    );
    expect(selectDevices({ data: { results: devices } })).toEqual(devices);
    expect(selectDevices(devices)).toEqual(devices);
    expect(
      selectDevices({
        message: 'Rate limit exceeded',
        errors: { message: ['Too many attempts'] },
      }),
    ).toEqual([]);
  });

  it('records failed device fetch time to avoid automatic retry loops', () => {
    const before = Date.now();
    const state = reducer(undefined, failed({ message: 'Rate limit exceeded' }));

    expect(state.loading).toBe(false);
    expect(state.error).toEqual({ message: 'Rate limit exceeded' });
    expect(state.lastFetchedAt).toBeGreaterThanOrEqual(before);
  });

  it('uses the selected device ID as its MQTT topic', () => {
    expect(selectDeviceMqttTopic({ device_id: ' DEV-001 ' })).toBe('DEV-001');
    expect(selectDeviceMqttTopic({ deviceId: 'DEV-002' })).toBe('DEV-002');
    expect(selectDeviceMqttTopic({ id: 123 })).toBe('');
    expect(selectDeviceMqttTopic(null)).toBe('');
  });

  it('builds the complete password reset request chain', () => {
    expect(
      forgotPassword({ email: 'user@example.test' }).payload,
    ).toMatchObject({
      url: '/api/v1/auth/forgot-password',
      data: { email: 'user@example.test' },
    });

    expect(
      verifyOtp({ email: 'user@example.test', code: '482917' }).payload,
    ).toMatchObject({
      url: '/api/v1/auth/verify-otp',
      data: { email: 'user@example.test', code: '482917' },
    });

    expect(
      resetPassword({
        resetToken: 'reset-token',
        password: 'StrongPass1!',
        password_confirmation: 'StrongPass1!',
      }).payload,
    ).toMatchObject({
      url: '/api/v1/auth/reset-password',
      headers: { 'X-Reset-Token': 'reset-token' },
      data: {
        password: 'StrongPass1!',
        password_confirmation: 'StrongPass1!',
      },
    });
  });
});
