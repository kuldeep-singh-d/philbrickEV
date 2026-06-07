import {
  createSlice,
  PayloadAction,
  SliceCaseReducers,
  ValidateSliceCaseReducers,
} from '@reduxjs/toolkit';

export interface GenericState<T> {
  data?: T;
  loading?: boolean;
  error?: T;
}

const createGenericSlice = <
  T,
  Reducers extends SliceCaseReducers<GenericState<T>>,
>({
  reducers,
  name = '',
  initialState,
}: {
  name: string;
  initialState: GenericState<T>;
  reducers: ValidateSliceCaseReducers<GenericState<T>, Reducers>;
}) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      start(state) {
        state.loading = true;
      },
      success(state: GenericState<T>, action: PayloadAction<T>) {
        state.data = action.payload;
        state.loading = false;
        state.error = undefined;
      },
      failed(state: GenericState<T>, action: PayloadAction<T>) {
        state.data = undefined;
        state.loading = false;
        state.error = action.payload;
      },
      reset: state => {
        state.data = undefined;
        state.loading = false;
        state.error = undefined;
      },
      ...reducers,
    },
  });
};

export default createGenericSlice;
