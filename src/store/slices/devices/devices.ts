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
    lastFetchedAt: undefined as number | undefined,
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
      state.lastFetchedAt = Date.now();
    },
    failed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.lastFetchedAt = Date.now();
    },
    reset: state => {
      state.data = undefined;
      state.loading = false;
      state.error = undefined;
      state.lastFetchedAt = undefined;
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
    dedupe: true,
  });

export const clearDevicesResponse = () => reset();

const isDeviceList = (value: unknown): value is Device[] =>
  Array.isArray(value) &&
  value.every(
    item =>
      item === null ||
      (typeof item === 'object' && !Array.isArray(item)),
  );

const DEVICE_LIST_KEYS = [
  'devices',
  'device',
  'chargers',
  'evses',
  'items',
  'records',
  'results',
  'rows',
  'data',
];

const findDeviceList = (value: unknown, depth = 0): Device[] | undefined => {
  if (isDeviceList(value)) {
    return value;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 5) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const key of DEVICE_LIST_KEYS) {
    const result = findDeviceList(record[key], depth + 1);

    if (result) {
      return result;
    }
  }

  return undefined;
};

export const selectDevices = (response: any): Device[] => {
  return findDeviceList(response) || [];
};

export const selectDeviceMqttTopic = (device?: Device | null) => {
  const topic = device?.device_id ?? device?.deviceId;

  return typeof topic === 'string' ? topic.trim() : '';
};

export const DEVICE_LIST_CACHE_TTL_MS = 5 * 60 * 1000;

export const isDeviceListCacheStale = (
  lastFetchedAt?: number,
  now = Date.now(),
) => !lastFetchedAt || now - lastFetchedAt > DEVICE_LIST_CACHE_TTL_MS;
