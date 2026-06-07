import createGenericSlice from '@store/types';
import { apiCallBegan } from '@store/apiActions';

const slice = createGenericSlice({
  name: 'app-theme',
  initialState: {
    data: 'light',
  },
  reducers: {
    onChange: (state, action) => {
      state.data = action.payload;
    },
  },
});

const { onChange } = slice.actions;
export default slice.reducer;

export const setAppTheme = (data: any) =>
  apiCallBegan({ onChange: onChange.type, data: data as any } as any);
