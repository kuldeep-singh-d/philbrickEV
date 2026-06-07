import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';

const slice = createSlice({
  name: 'handalLoading',
  initialState: {
    status: false,
  },
  reducers: {
    onChange: (state, action) => {
      state.status = action.payload;
    },
  },
});

const { onChange } = slice.actions;
export default slice.reducer;

export const handalLoading = (data: any) => {
  return apiCallBegan({ onChange: onChange.type, data });
};
