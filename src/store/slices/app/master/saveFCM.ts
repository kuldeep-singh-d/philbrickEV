import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

const slice = createSlice({
  name: 'save-fcm',
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

export const saveFCM = (token: string) =>
  apiCallBegan({
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    url: `${apiRoutes.saveFCM}${token}`,
  });

export const clearSaveFCMRes = () => apiCallBegan({ onReset: reset.type });
