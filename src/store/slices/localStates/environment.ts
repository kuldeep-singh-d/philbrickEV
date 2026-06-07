import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EnvironmentData {
  domain: string;
  client_name: string;
  project_name: string;
  project_code: string;
  Contact_Number: string;
  [key: string]: any;
}

const slice = createSlice({
  name: 'environment',
  initialState: {
    data: null as EnvironmentData | null,
  },
  reducers: {
    setEnvironmentData: (state, action: PayloadAction<EnvironmentData>) => {
      state.data = action.payload;
    },
    clearEnvironment: state => {
      state.data = null;
    },
  },
});

const { setEnvironmentData, clearEnvironment } = slice.actions;
export { clearEnvironment };
export default slice.reducer;

// Plain action creator — no API call needed, just stores locally in Redux
export const setEnvironment = (data: EnvironmentData) =>
  setEnvironmentData(data);
