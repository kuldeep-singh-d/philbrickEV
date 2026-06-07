import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// global states
import appTheme from './slices/localStates/appTheme';

import logout from './slices/auth/logout';
import loginState from './slices/localStates/loginState';
import handalLoading from './slices/localStates/handalLoading';
import getNotifications from './slices/app/notifications/getNotifications';
import readAllNotifications from './slices/app/notifications/readAllNotifications';

import login from './slices/auth/login';
import saveFCM from './slices/app/master/saveFCM';
import getVCards from './slices/app/master/getVcards';
import getProfile from './slices/app/profile/getProfile';
import addVisitor from './slices/app/visitor/addVisitor';
import getSuppliers from './slices/app/master/suppliers';
import getCustomers from './slices/app/master/customers';
import getVisitors from './slices/app/visitor/getVisitors';
import getCompanies from './slices/app/master/getCompanies';
import getPermissions from './slices/app/master/getPermissions';
import getVisitorType from './slices/app/master/visitirType';
import setEnvironment from './slices/localStates/environment';
import rejectVisitor from './slices/app/visitor/rejectVisitor';
import getPersonToMeet from './slices/app/master/personToMeet';
import acceptVisitor from './slices/app/visitor/acceptVisitor';
import getMaterialUnits from './slices/app/master/materialUnits';
import approveVisitor from './slices/app/visitor/approveVisitor';
import checkoutVisitor from './slices/app/visitor/checkoutVisitor';
import getVisitorDetail from './slices/app/visitor/getVisitorDetail';
import getDashboardData from './slices/app/dashboard/getDashbordData';
import getVisitorByNumber from './slices/app/visitor/getVisitorByNumber';
import addMaterialInward from './slices/app/materialInwards/addMaterialInward';
import getMaterialInwards from './slices/app/materialInwards/getMaterialInwards';
import addMaterialOutward from './slices/app/materialOutwards/addMaterialOutWards';
import getMaterialOutwards from './slices/app/materialOutwards/getMaterialOutwards';
import getMaterialInwardDetail from './slices/app/materialInwards/getMaterialInwardDetail';
import getMaterialOutwardDetail from './slices/app/materialOutwards/getMaterialOutwardDetail';
import getPackingUsers from './slices/app/master/getPackingUsers';
import getSecurityUsers from './slices/app/master/getSecurityUsers';
import markAsReadyInward from './slices/app/materialInwards/markAsReadyInward';
import markAsReadyOutward from './slices/app/materialOutwards/markAsReadyOutward';

const reducers = combineReducers({
  login,
  saveFCM,
  getProfile,
  addVisitor,
  getVisitors,
  getCustomers,
  getSuppliers,
  getCompanies,
  getPermissions,
  rejectVisitor,
  acceptVisitor,
  approveVisitor,
  getVisitorType,
  setEnvironment,
  getPersonToMeet,
  checkoutVisitor,
  getMaterialUnits,
  getVisitorDetail,
  getDashboardData,
  addMaterialInward,
  getVisitorByNumber,
  getMaterialInwards,
  getMaterialInwardDetail,
  addMaterialOutward,
  getMaterialOutwards,
  getMaterialOutwardDetail,

  logout,
  appTheme,
  getVCards,
  loginState,
  handalLoading,
  getNotifications,
  readAllNotifications,
  getPackingUsers,
  getSecurityUsers,
  markAsReadyInward,
  markAsReadyOutward,
});

// root reducer to detect each and every reducer passed by
// handled logout reducer here and empty all the reducers and local storage
const rootReducer = (state: any, action: any) => {
  if (action.type === 'login/reset') {
    AsyncStorage.clear().catch(() => {});
    state = {
      appTheme: state?.appTheme,
      loginState: state?.loginState,
      setEnvironment: state?.setEnvironment, // preserve company selection across logout
    };
  }
  return reducers(state, action);
};

export default rootReducer;
