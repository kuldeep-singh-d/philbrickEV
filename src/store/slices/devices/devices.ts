import { createSlice } from '@reduxjs/toolkit';

import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

export interface Device {
  id?: number | string;
  device_id?: string;
  deviceId?: string;
  name?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

const slice = createSlice({
  name: 'devices',
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

export const fetchDevices = () =>
  apiCallBegan({
    isRowData: true,
    url: apiRoutes.devices,
    method: methods.GET,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const clearDevicesResponse = () => reset();

export const selectDevices = (response: any): Device[] => {
  const data = response?.data;
  const candidates = [
    response,
    data,
    data?.data,
    data?.devices,
    response?.devices,
  ];

  return candidates.find(Array.isArray) || [];
};

export const selectDeviceMqttTopic = (device?: Device | null) => {
  const topic = device?.device_id ?? device?.deviceId;

  return typeof topic === 'string' ? topic.trim() : '';
};
