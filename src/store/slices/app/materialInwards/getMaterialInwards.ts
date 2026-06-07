import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

const slice = createSlice({
  name: 'get-material-inwards',
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

export const getMaterialInwards = (page?: number) =>
  apiCallBegan({
    method: methods.GET,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    url: page
      ? `${apiRoutes.materialInwards}?page=${page}`
      : apiRoutes.materialInwards,
  });

export const clearMaterialInwardsRes = () =>
  apiCallBegan({ onReset: reset.type });
