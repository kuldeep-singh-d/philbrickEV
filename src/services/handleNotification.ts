import notifee, {
  AndroidImportance,
  AuthorizationStatus as NotifeeAuthorizationStatus,
  Event,
  EventType,
} from '@notifee/react-native';
import {
  AuthorizationStatus,
  RemoteMessage,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import store from '@store/configureStore';
import { refreshAllLists } from '@store/actions/refreshAllLists';
import { openAlertsFromNotification } from '@navigation/notificationNavigation';

export const NOTIFICATION_CHANNEL_ID = 'general';
export const NOTIFICATION_SMALL_ICON = 'ic_stat_philbrick_ev';

let permissionRequest: Promise<string | null> | null = null;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown notification error';
};

const logNotificationWarning = (message: string, error: unknown) => {
  console.warn(message, getErrorMessage(error));
};

const isPressEvent = ({ type }: Event) =>
  type === EventType.PRESS || type === EventType.ACTION_PRESS;

const getNotificationData = (remoteMessage: RemoteMessage) => {
  const data = remoteMessage.data || {};

  return {
    ...data,
    ...(remoteMessage.messageId ? { messageId: remoteMessage.messageId } : {}),
  };
};

const getNotificationContent = (remoteMessage: RemoteMessage) => {
  const data = remoteMessage.data || {};

  return {
    title:
      remoteMessage.notification?.title ||
      (typeof data.title === 'string' ? data.title : 'Philbrick EV'),
    body:
      remoteMessage.notification?.body ||
      (typeof data.body === 'string'
        ? data.body
        : 'You have a new notification.'),
  };
};

export const createNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'General notifications',
    description: 'Device alerts and Philbrick EV updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
};

export const displayRemoteNotification = async (
  remoteMessage: RemoteMessage,
) => {
  await createNotificationChannel();

  const { title, body } = getNotificationContent(remoteMessage);

  await notifee.displayNotification({
    id: remoteMessage.messageId,
    title,
    body,
    data: getNotificationData(remoteMessage),
    android: {
      channelId: NOTIFICATION_CHANNEL_ID,
      smallIcon: NOTIFICATION_SMALL_ICON,
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        badge: true,
        banner: true,
        list: true,
        sound: true,
      },
    },
  });
};

const handleNotificationPress = (data?: Record<string, unknown>) => {
  console.log('Notification opened:', data || {});
  refreshAllLists(store.dispatch);
  openAlertsFromNotification();
};

const handleNotifeeEvent = async (event: Event) => {
  if (isPressEvent(event)) {
    handleNotificationPress(event.detail.notification?.data);
  }
};

const hasAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const hasIOSNotificationPermission = async () => {
  const messaging = getMessaging();
  let status = await hasPermission(messaging);

  if (status === AuthorizationStatus.NOT_DETERMINED) {
    status = await requestPermission(messaging, {
      alert: true,
      badge: true,
      sound: true,
    });
  }

  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

const requestPermissionAndFetchToken = async () => {
  try {
    const enabled =
      Platform.OS === 'ios'
        ? await hasIOSNotificationPermission()
        : await hasAndroidNotificationPermission();

    if (!enabled) {
      console.log('Notification permission was not granted.');
      return null;
    }

    const notificationSettings = await notifee.getNotificationSettings();
    if (
      notificationSettings.authorizationStatus ===
      NotifeeAuthorizationStatus.DENIED
    ) {
      console.log('Notifications are disabled in system settings.');
      return null;
    }

    await createNotificationChannel();

    const token = await getToken(getMessaging());
    console.log('FCM token:', token);
    return token;
  } catch (error) {
    logNotificationWarning(
      'Unable to initialize Firebase notifications:',
      error,
    );
    return null;
  }
};

export const requestNotificationPermissionAndToken = () => {
  if (!permissionRequest) {
    permissionRequest = requestPermissionAndFetchToken().finally(() => {
      permissionRequest = null;
    });
  }

  return permissionRequest;
};

export const registerNotificationBackgroundHandlers = () => {
  try {
    setBackgroundMessageHandler(
      getMessaging(),
      async (remoteMessage: RemoteMessage) => {
        console.log('FCM background message:', remoteMessage.messageId);

        if (!remoteMessage.notification) {
          await displayRemoteNotification(remoteMessage);
        }

        refreshAllLists(store.dispatch);
      },
    );
  } catch (error) {
    logNotificationWarning(
      'Unable to register the FCM background handler:',
      error,
    );
  }

  notifee.onBackgroundEvent(handleNotifeeEvent);
};

export const initializeNotificationListeners = () => {
  const unsubscribers: Array<() => void> = [];

  createNotificationChannel().catch(error => {
    logNotificationWarning('Unable to create the notification channel:', error);
  });

  try {
    const messaging = getMessaging();

    unsubscribers.push(
      onMessage(messaging, async remoteMessage => {
        console.log('FCM foreground message:', remoteMessage.messageId);
        await displayRemoteNotification(remoteMessage);
        refreshAllLists(store.dispatch);
      }),
      onTokenRefresh(messaging, token => {
        console.log('FCM token refreshed:', token);
      }),
    );
  } catch (error) {
    logNotificationWarning(
      'Unable to register Firebase notification listeners:',
      error,
    );
  }

  unsubscribers.push(notifee.onForegroundEvent(handleNotifeeEvent));

  if (Platform.OS === 'android') {
    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (initialNotification) {
          handleNotificationPress(initialNotification.notification.data);
        }
      })
      .catch(error => {
        logNotificationWarning(
          'Unable to read the initial notification:',
          error,
        );
      });
  } else {
    try {
      getInitialNotification(getMessaging())
        .then(remoteMessage => {
          if (remoteMessage) {
            handleNotificationPress(remoteMessage.data);
          }
        })
        .catch(error => {
          logNotificationWarning(
            'Unable to read the initial FCM notification:',
            error,
          );
        });
    } catch (error) {
      logNotificationWarning(
        'Unable to initialize iOS notification opening:',
        error,
      );
    }
  }

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};
