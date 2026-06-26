import { createSlice } from '@reduxjs/toolkit';

import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

export type ChargingSession = {
  id?: number | string;
  device_id?: number | string;
  started_at?: string;
  ended_at?: string;
  duration?: string | number;
  duration_seconds?: number;
  duration_minutes?: number;
  energy?: number | string;
  energy_kwh?: number | string;
  kwh?: number | string;
  device?: {
    id?: number | string;
    device_id?: number | string;
    name?: string;
    location?: string;
  };
  [key: string]: unknown;
};

type ChargingSessionsState = {
  data: any | undefined;
  items: ChargingSession[];
  loading: boolean;
  error: any | undefined;
  page: number;
  hasMore: boolean;
};

const initialState: ChargingSessionsState = {
  data: undefined,
  items: [],
  loading: false,
  error: undefined,
  page: 1,
  hasMore: false,
};

const getPaginatedContainer = (response: any) => {
  const data = response?.data;

  return (
    data?.charging_sessions ??
    response?.charging_sessions ??
    data?.sessions ??
    response?.sessions ??
    data
  );
};

const getPaginator = (response: any) => {
  const data = response?.data;
  const paginatedContainer = getPaginatedContainer(response);
  const meta = response?.meta ?? data?.meta ?? data?.pagination;
  const paginator = Array.isArray(paginatedContainer)
    ? undefined
    : paginatedContainer;

  return {
    currentPage:
      Number(
        meta?.current_page ?? paginator?.current_page ?? response?.current_page,
      ) || 1,
    lastPage:
      Number(meta?.last_page ?? paginator?.last_page ?? response?.last_page) ||
      1,
    nextPageUrl:
      meta?.next_page_url ??
      paginator?.next_page_url ??
      response?.next_page_url,
  };
};

export const selectChargingSessions = (response: any): ChargingSession[] => {
  const data = response?.data;
  const paginatedContainer = getPaginatedContainer(response);
  const candidates = [
    paginatedContainer,
    paginatedContainer?.data,
    paginatedContainer?.items,
    paginatedContainer?.charging_sessions,
    data?.sessions,
    data?.data,
    data?.items,
    data?.charging_sessions,
    response?.sessions,
    response?.charging_sessions,
    data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
};

const slice = createSlice({
  name: 'chargingSessions',
  initialState,
  reducers: {
    requested: state => {
      state.loading = true;
      state.error = undefined;
    },
    success: (state, action) => {
      const rows = selectChargingSessions(action.payload);
      const paginator = getPaginator(action.payload);
      const shouldAppend = paginator.currentPage > 1;

      state.data = action.payload;
      state.items = shouldAppend ? [...state.items, ...rows] : rows;
      state.loading = false;
      state.error = undefined;
      state.page = paginator.currentPage;
      state.hasMore =
        Boolean(paginator.nextPageUrl) ||
        paginator.currentPage < paginator.lastPage;
    },
    failed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.hasMore = false;
    },
    reset: state => {
      state.data = undefined;
      state.items = [];
      state.loading = false;
      state.error = undefined;
      state.page = 1;
      state.hasMore = false;
    },
  },
});

export const { requested, success, failed, reset } = slice.actions;
export default slice.reducer;

export const fetchChargingSessions = ({
  deviceId,
  page = 1,
  perPage = 25,
}: {
  deviceId?: string | number;
  page?: number;
  perPage?: number;
}) =>
  apiCallBegan({
    isRowData: true,
    method: methods.GET,
    url: apiRoutes.chargingSessionsList,
    params: {
      ...(deviceId ? { device_id: deviceId } : {}),
      per_page: perPage,
      page,
    },
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const clearChargingSessions = () => reset();
