import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';
import type { MobileDeviceDescriptor } from '@utils/mobileDevice';

interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
  device: MobileDeviceDescriptor;
  password_confirmation: string;
}

const slice = createSlice({
  name: 'register',
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

export const register = (data: RegisterPayload) =>
  apiCallBegan({
    data,
    isRowData: true,
    url: apiRoutes.register,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const clearRegisterRes = () => reset();
