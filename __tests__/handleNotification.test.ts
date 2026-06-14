import notifee from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import {
  displayRemoteNotification,
  initializeNotificationListeners,
  registerNotificationBackgroundHandlers,
  requestNotificationPermissionAndToken,
} from '../src/services/handleNotification';

jest.mock('../src/store/actions/refreshAllLists', () => ({
  refreshAllLists: jest.fn(),
}));

describe('notification handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hasPermission as jest.Mock).mockResolvedValue(1);
    (getToken as jest.Mock).mockResolvedValue('test-fcm-token');
  });

  it('displays a foreground remote message with the production channel', async () => {
    await displayRemoteNotification({
      messageId: 'message-1',
      notification: {
        title: 'Charger alert',
        body: 'Charging stopped',
      },
      fcmOptions: {},
    });

    expect(notifee.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'message-1',
        title: 'Charger alert',
        body: 'Charging stopped',
        android: expect.objectContaining({
          channelId: 'general',
          smallIcon: 'ic_stat_philbrick_ev',
        }),
      }),
    );
  });

  it('registers one foreground FCM listener', () => {
    const unsubscribe = initializeNotificationListeners();

    expect(getMessaging).toHaveBeenCalled();
    expect(onMessage).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('returns the FCM token after notification permission is granted', async () => {
    await expect(requestNotificationPermissionAndToken()).resolves.toBe(
      'test-fcm-token',
    );

    expect(getToken).toHaveBeenCalledTimes(1);
  });

  it('only renders data-only messages in the background', async () => {
    registerNotificationBackgroundHandlers();

    const backgroundHandler = (
      setBackgroundMessageHandler as jest.Mock
    ).mock.calls[0][1];

    await backgroundHandler({
      messageId: 'system-rendered',
      notification: { title: 'System notification' },
      fcmOptions: {},
    });
    expect(notifee.displayNotification).not.toHaveBeenCalled();

    await backgroundHandler({
      messageId: 'data-only',
      data: { title: 'Data notification', body: 'Background update' },
      fcmOptions: {},
    });
    expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
  });
});
