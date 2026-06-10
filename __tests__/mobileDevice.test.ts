import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearUserStorage,
  getInstallationId,
  getMobileDeviceDescriptor,
} from '../src/utils/mobileDevice';

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('mobile device descriptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reuses an existing per-install identifier', async () => {
    storage.getItem.mockResolvedValueOnce('existing-install-id');

    await expect(getInstallationId()).resolves.toBe('existing-install-id');
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('creates and persists an identifier when one does not exist', async () => {
    storage.getItem.mockResolvedValueOnce(null);

    const installationId = await getInstallationId();

    expect(installationId).toEqual(expect.any(String));
    expect(storage.setItem).toHaveBeenCalledWith(
      '@philbrickEV/installation-id',
      installationId,
    );
  });

  it('builds the backend device payload', async () => {
    storage.getItem.mockResolvedValueOnce('install-123');

    await expect(getMobileDeviceDescriptor()).resolves.toMatchObject({
      hash: 'install-123',
      name: expect.any(String),
      platform: expect.stringMatching(/^(android|ios)$/),
      os_version: expect.any(String),
    });
  });

  it('clears user data while preserving the installation identifier', async () => {
    storage.getItem.mockResolvedValueOnce('install-123');

    await clearUserStorage();

    expect(storage.clear).toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalledWith(
      '@philbrickEV/installation-id',
      'install-123',
    );
  });
});
