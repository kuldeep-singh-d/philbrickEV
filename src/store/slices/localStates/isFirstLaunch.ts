import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';

const slice = createSlice({
  name: 'first-launch-state',
  initialState: {
    isFirstLaunch: true,
  },
  reducers: {
    onChange: (state, action) => {
      state.isFirstLaunch = action.payload;
    },
  },
});

const { onChange } = slice.actions;
export default slice.reducer;

export const setFirstLaunch = (data: any) =>
  apiCallBegan({ onChange: onChange.type, data });
