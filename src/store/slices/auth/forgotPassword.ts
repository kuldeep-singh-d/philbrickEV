import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

interface EmailPayload {
  email: string;
}

const slice = createSlice({
  name: 'forgot-password',
  initialState: {
    data: undefined as any | undefined,
    loading: false,
    error: undefined,
  },
  reducers: {
    requested: state => {
      state.loading = true;
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

export const forgotPassword = (data: EmailPayload) =>
  apiCallBegan({
    data,
    isRowData: true,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    url: apiRoutes.forgotPassword,
  });

export const resendOtp = (data: EmailPayload) =>
  apiCallBegan({
    data,
    isRowData: true,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    url: apiRoutes.resendOtp,
  });

export const clearForgotPasswordRes = () => reset();
