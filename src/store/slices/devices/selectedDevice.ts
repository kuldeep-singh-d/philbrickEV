import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Device } from './devices';

interface SelectedDeviceState {
  data: Device | null;
}

const initialState: SelectedDeviceState = {
  data: null,
};

const slice = createSlice({
  name: 'selectedDevice',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<Device>) => {
      state.data = action.payload;
    },
    clearSelectedDevice: state => {
      state.data = null;
    },
  },
});

export const { setSelectedDevice, clearSelectedDevice } = slice.actions;
export default slice.reducer;
