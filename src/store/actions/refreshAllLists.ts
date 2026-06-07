import { getVisitors } from '@store/slices/app/visitor/getVisitors';
import { getDashboardData } from '@store/slices/app/dashboard/getDashbordData';
import { getMaterialInwards } from '@store/slices/app/materialInwards/getMaterialInwards';
import { getMaterialOutwards } from '@store/slices/app/materialOutwards/getMaterialOutwards';

/**
 * Dispatches all list API calls to refresh data across the app.
 * Used by pull-to-refresh, screen focus handlers, and FCM notification listeners.
 */
export const refreshAllLists = (dispatch: any) => {
  dispatch(getVisitors());
  dispatch(getDashboardData());
  dispatch(getMaterialInwards());
  dispatch(getMaterialOutwards());
};
