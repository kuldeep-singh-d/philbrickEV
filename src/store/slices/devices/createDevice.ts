import { createSlice } from '@reduxjs/toolkit';

import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

export interface CreateDevicePayload {
  device_id: string;
  name: string;
  location: string;
}

const slice = createSlice({
  name: 'create-device',
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
      state.data = action.payload || {};
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

export const createDevice = (data: CreateDevicePayload) =>
  apiCallBegan({
    data,
    isRowData: true,
    url: apiRoutes.devices,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const clearCreateDeviceResponse = () => reset();
