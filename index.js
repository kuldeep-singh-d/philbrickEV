/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerNotificationBackgroundHandlers } from './src/services/handleNotification';

const getRuntimeErrorMessage = error => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error || 'Unknown runtime error');
};

if (global.ErrorUtils?.setGlobalHandler) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[Global JS Error]', {
      isFatal,
      message: getRuntimeErrorMessage(error),
    });
  });
}

registerNotificationBackgroundHandlers();
AppRegistry.registerComponent(appName, () => App);
