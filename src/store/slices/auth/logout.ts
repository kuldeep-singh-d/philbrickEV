import createGenericSlice from '@store/types';
import { apiCallBegan } from '@store/apiActions';
import { apiRoutes, methods } from '@store/apiRoutes';

export interface DataType {
  message: string;
  full_name: string;
}

const slice = createGenericSlice({
  name: 'logout',
  initialState: {
    data: undefined as DataType | undefined,
    loading: false,
    error: undefined,
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
      state.loading = false;
      state.data = undefined;
      state.error = action.payload;
    },
    reset: state => {
      state.loading = false;
      state.data = undefined;
      state.error = undefined;
    },
  },
});

const { requested, success, failed, reset } = slice.actions;
export default slice.reducer;

export const logout = (employeeId: any) =>
  apiCallBegan({
    isLogin: true,
    method: methods.POST,
    onFailed: failed.type,
    onStart: requested.type,
    onSuccess: success.type,
    url: `${apiRoutes.logout}?employeeId=${employeeId}`,
  });

export const clearLogoutResponse = () => apiCallBegan({ onReset: reset.type });
