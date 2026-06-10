import { fetchDevices } from '@store/slices/devices/devices';

/**
 * Dispatches all list API calls to refresh data across the app.
 * Used by pull-to-refresh, screen focus handlers, and FCM notification listeners.
 */
export const refreshAllLists = (dispatch: any) => {
  dispatch(fetchDevices());
};
