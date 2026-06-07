import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

const slice = createSlice({
  name: 'get-vcards',
  initialState: {
    loading: false,
    error: undefined,
    data: undefined as any | undefined,
  },
  reducers: {
    requested: state => {
      state.loading = true;
    },
    success: (state, action) => {
      state.loading = false;
      state.error = undefined;
      state.data = action.payload;
    },
    failed: (state, action) => {
      state.data = undefined;
      state.loading = false;
      state.error = action.payload;
    },
    reset: state => {
      state.loading = false;
      state.data = undefined;
      state.error = undefined;
    },
  },
});

export const { requested, success, failed, reset } = slice.actions;
export default slice.reducer;

export const getVCards = () =>
  apiCallBegan({
    method: methods.GET,
    onFailed: failed.type,
    url: apiRoutes.vcards,
    onStart: requested.type,
    onSuccess: success.type,
  });

export const clearGetVCardsRes = () => apiCallBegan({ onReset: reset.type });
