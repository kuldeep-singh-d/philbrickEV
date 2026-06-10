import { createSlice } from '@reduxjs/toolkit';

import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

interface RegistrationOtpPayload {
  email: string;
}

const slice = createSlice({
  name: 'registration-otp',
  initialState: {
    data: undefined as any | undefined,
    loading: false,
    error: undefined as any | undefined,
  },
  reducers: {
    requested: state => {
      state.loading = true;
      state.error = undefined;
    },
    success: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = undefined;
    },
    failed: (state, action) => {
      state.data = undefined;
      state.loading = false;
      state.error = action.payload;
    },
    reset: state => {
      state.data = undefined;
      state.loading = false;
      state.error = undefined;
    },
  },
});

export const { requested, success, failed, reset } = slice.actions;
export default slice.reducer;

const requestRegistrationOtp = (url: string, data: RegistrationOtpPayload) =>
  apiCallBegan({
    data,
    isRowData: true,
    url,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const sendRegistrationOtp = (data: RegistrationOtpPayload) =>
  requestRegistrationOtp(apiRoutes.registrationSendOtp, data);

export const resendRegistrationOtp = (data: RegistrationOtpPayload) =>
  requestRegistrationOtp(apiRoutes.registrationResendOtp, data);

export const clearRegistrationOtpRes = () => reset();
