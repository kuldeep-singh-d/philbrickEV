import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissionAndToken } from '../services/handleNotification';

const INSTALLATION_ID_KEY = '@philbrickEV/installation-id';

export interface MobileDeviceDescriptor {
  hash: string;
  name: string;
  platform: 'android' | 'ios';
  model?: string;
  os_version?: string;
  fcm_token?: string | null;
}

const createInstallationId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 14);

  return `${timestamp}-${random}`;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race<T | null>([
    promise,
    new Promise<null>(resolve => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);

export const getInstallationId = async () => {
  const storedId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);

  if (storedId) {
    return storedId;
  }

  const installationId = createInstallationId();
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);

  return installationId;
};

export const clearUserStorage = async () => {
  const installationId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);

  await AsyncStorage.clear();

  if (installationId) {
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);
  }
};

export const getMobileDeviceDescriptor =
  async (): Promise<MobileDeviceDescriptor> => {
    const constants = Platform.constants as Record<string, unknown>;
    const modelValue =
      Platform.OS === 'android'
        ? constants.Model
        : constants.interfaceIdiom || constants.systemName;
    const model =
      typeof modelValue === 'string' && modelValue.trim()
        ? modelValue.trim()
        : undefined;

    const fcmToken = await withTimeout(
      requestNotificationPermissionAndToken(),
      2500,
    ).catch(() => null);

    if (!fcmToken) {
      requestNotificationPermissionAndToken().catch(() => null);
    }

    return {
      hash: await getInstallationId(),
      name:
        model || (Platform.OS === 'android' ? 'Android device' : 'iOS device'),
      platform: Platform.OS === 'android' ? 'android' : 'ios',
      ...(model ? { model } : {}),
      os_version: String(Platform.Version),
      fcm_token: fcmToken,
    };
  };
