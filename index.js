/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerNotificationBackgroundHandlers } from './src/services/handleNotification';

registerNotificationBackgroundHandlers();
AppRegistry.registerComponent(appName, () => App);
