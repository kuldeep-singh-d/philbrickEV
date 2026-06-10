import { login } from '../src/store/slices/auth/login';
import { logout } from '../src/store/slices/auth/logout';
import { register } from '../src/store/slices/auth/register';
import {
  resendRegistrationOtp,
  sendRegistrationOtp,
} from '../src/store/slices/auth/registrationOtp';

const device = {
  hash: 'install-123',
  name: 'Test device',
  platform: 'android' as const,
  model: 'Test model',
  os_version: '14',
};

describe('auth API actions', () => {
  it('includes the mobile device in login requests', () => {
    const action = login({
      identifier: 'bob_2024',
      password: 'StrongPass1!',
      device,
    });

    expect(action.payload).toMatchObject({
      url: '/api/v1/auth/login',
      method: 'POST',
      isRowData: true,
      data: {
        identifier: 'bob_2024',
        password: 'StrongPass1!',
        device,
      },
    });
  });

  it('includes OTP and mobile device in registration requests', () => {
    const action = register({
      name: 'Bob Smith',
      username: 'bob_2024',
      email: 'bob@example.test',
      phone: '+15551112222',
      password: 'StrongPass1!',
      otp: '482917',
      device,
      password_confirmation: 'StrongPass1!',
    });

    expect(action.payload).toMatchObject({
      url: '/api/v1/auth/register',
      method: 'POST',
      data: {
        otp: '482917',
        device,
      },
    });
  });

  it('uses the registration OTP and logout endpoints', () => {
    expect(
      sendRegistrationOtp({ email: 'bob@example.test' }).payload.url,
    ).toBe('/api/v1/auth/registration/send-otp');
    expect(
      resendRegistrationOtp({ email: 'bob@example.test' }).payload.url,
    ).toBe('/api/v1/auth/registration/resend-otp');
    expect(logout().payload.url).toBe('/api/v1/auth/logout');
  });
});
