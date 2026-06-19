export const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export const apiRoutes = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/register',
  forgotPassword: '/api/v1/auth/forgot-password',
  resendOtp: '/api/v1/auth/resend-otp',
  verifyOtp: '/api/v1/auth/verify-otp',
  resetPassword: '/api/v1/auth/reset-password',
  registrationSendOtp: '/api/v1/auth/registration/send-otp',
  registrationResendOtp: '/api/v1/auth/registration/resend-otp',
  logout: '/api/v1/auth/logout',
  logoutAll: '/api/v1/auth/logout-all',
  devices: '/api/v1/devices',
  chargingSessions: (deviceId: string | number) =>
    `/api/v1/devices/${encodeURIComponent(String(deviceId))}/charging-sessions`,
};
