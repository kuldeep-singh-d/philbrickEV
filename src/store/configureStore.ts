import reducer from './reducer';
import api from './middleware/api';
import { persistReducer } from 'redux-persist';
import localState from './middleware/localState';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  timeout: 0,
  storage: AsyncStorage,
};

const middlewareConfig = {
  immutableCheck: false,
  serializableCheck: false,
};

// persisted Reducer with root reduer
const persistedReducer = persistReducer(persistConfig, reducer);

// exported store here
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware(middlewareConfig).concat(api, localState),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
