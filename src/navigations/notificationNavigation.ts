import { createNavigationContainerRef } from '@react-navigation/native';

import { routes } from './routes';

export const navigationRef = createNavigationContainerRef();

let shouldOpenAlerts = false;

const canOpenAlerts = () =>
  navigationRef.isReady() &&
  navigationRef.getRootState().routeNames.includes(routes.app.alerts);

export const openAlertsFromNotification = () => {
  if (canOpenAlerts()) {
    navigationRef.navigate(routes.app.alerts as never);
    shouldOpenAlerts = false;
    return;
  }

  shouldOpenAlerts = true;
};

export const flushNotificationNavigation = () => {
  if (shouldOpenAlerts && canOpenAlerts()) {
    navigationRef.navigate(routes.app.alerts as never);
    shouldOpenAlerts = false;
  }
};
