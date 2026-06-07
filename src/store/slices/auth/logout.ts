import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'logout',
  initialState: {
    data: undefined as any | undefined,
    loading: false,
    error: undefined,
  },
  reducers: {
    reset: state => {
      state.data = undefined;
      state.loading = false;
      state.error = undefined;
    },
  },
});

export const { reset } = slice.actions;
export default slice.reducer;

export const clearLogoutResponse = () => reset();
