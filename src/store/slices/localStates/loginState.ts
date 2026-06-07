import { createSlice } from '@reduxjs/toolkit';
import { apiCallBegan } from '@store/apiActions';

const slice = createSlice({
  name: 'login-state',
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

export const setLoginState = (data: any) =>
  apiCallBegan({ onChange: onChange.type, data });
