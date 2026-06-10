import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const INSTALLATION_ID_KEY = '@philbrickEV/installation-id';

export interface MobileDeviceDescriptor {
  hash: string;
  name: string;
  platform: 'android' | 'ios';
  model?: string;
  os_version?: string;
}

const createInstallationId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 14);

  return `${timestamp}-${random}`;
};

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

    return {
      hash: await getInstallationId(),
      name: model || (Platform.OS === 'android' ? 'Android device' : 'iOS device'),
      platform: Platform.OS === 'android' ? 'android' : 'ios',
      ...(model ? { model } : {}),
      os_version: String(Platform.Version),
    };
  };
