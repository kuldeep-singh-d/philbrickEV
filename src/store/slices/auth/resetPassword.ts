import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

interface ResetPasswordPayload {
  resetToken: string;
  password: string;
  password_confirmation: string;
}

const slice = createSlice({
  name: 'reset-password',
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

export const resetPassword = ({
  resetToken,
  password,
  password_confirmation,
}: ResetPasswordPayload) =>
  apiCallBegan({
    isRowData: true,
    method: methods.POST,
    url: apiRoutes.resetPassword,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    headers: { 'X-Reset-Token': resetToken },
    data: { password, password_confirmation },
  });

export const clearResetPasswordRes = () => reset();
