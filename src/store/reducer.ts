import { combineReducers } from 'redux';

// global states
import appTheme from './slices/localStates/appTheme';
import loginState from './slices/localStates/loginState';
import handalLoading from './slices/localStates/handalLoading';

// API States
import login from './slices/auth/login';
import register from './slices/auth/register';
import verifyOtp from './slices/auth/verifyOtp';
import resetPassword from './slices/auth/resetPassword';
import forgotPassword from './slices/auth/forgotPassword';
import logout from './slices/auth/logout';
import registrationOtp from './slices/auth/registrationOtp';
import devices from './slices/devices/devices';
import createDevice from './slices/devices/createDevice';

const reducers = combineReducers({
  login,
  register,
  verifyOtp,
  resetPassword,
  forgotPassword,
  logout,
  registrationOtp,
  devices,
  createDevice,
  appTheme,
  loginState,
  handalLoading,
});

// Reset user-scoped Redux state when the active login is cleared.
const rootReducer = (state: any, action: any) => {
  if (action.type === 'login/reset') {
    state = {
      appTheme: state?.appTheme,
      loginState: state?.loginState,
    };
  }
  return reducers(state, action);
};

export default rootReducer;
