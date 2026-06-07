import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// global states
import appTheme from './slices/localStates/appTheme';
import loginState from './slices/localStates/loginState';
import handalLoading from './slices/localStates/handalLoading';

// API States
import login from './slices/auth/login';

const reducers = combineReducers({
  login,
  appTheme,
  loginState,
  handalLoading,
});

// root reducer to detect each and every reducer passed by
// handled logout reducer here and empty all the reducers and local storage
const rootReducer = (state: any, action: any) => {
  if (action.type === 'login/reset') {
    AsyncStorage.clear().catch(() => {});
    state = {
      appTheme: state?.appTheme,
      loginState: state?.loginState,
    };
  }
  return reducers(state, action);
};

export default rootReducer;
