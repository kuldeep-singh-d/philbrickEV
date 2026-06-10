import {
  createDevice,
} from '../src/store/slices/devices/createDevice';
import {
  fetchDevices,
  selectDevices,
} from '../src/store/slices/devices/devices';
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
    expect(selectDevices(devices)).toEqual(devices);
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
