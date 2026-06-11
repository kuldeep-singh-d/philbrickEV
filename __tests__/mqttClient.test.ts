import { NativeModules, Platform } from 'react-native';
import {
  publishMqttMessage,
  startMqttConnection,
  stopMqttConnection,
  subscribeMqttTopic,
  unsubscribeMqttTopic,
} from '../src/mqtt/mqttClient';
import type { MqttConfig } from '../src/mqtt/mqttConfig';

const nativeModules = NativeModules as {
  MqttClient?: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    publish: jest.Mock;
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
  };
};

const enabledConfig: MqttConfig = {
  enabled: true,
  host: 'mqtt.example.com',
  port: 8883,
  clientId: 'test-client',
  cleanSession: true,
  keepAliveSeconds: 60,
  certificate: {
    certificateName: 'client.p12',
    certificatePassword: 'password',
  },
};

describe('mqttClient', () => {
  beforeEach(() => {
    nativeModules.MqttClient = {
      connect: jest.fn(config =>
        Promise.resolve({ connected: true, clientId: config.clientId }),
      ),
      disconnect: jest.fn().mockResolvedValue({ connected: false }),
      publish: jest.fn(options =>
        Promise.resolve({ published: true, ...options }),
      ),
      subscribe: jest.fn(options =>
        Promise.resolve({ subscribed: true, ...options }),
      ),
      unsubscribe: jest.fn(options =>
        Promise.resolve({ unsubscribed: true, ...options }),
      ),
    };
  });

  afterEach(async () => {
    await stopMqttConnection();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('skips connection when MQTT is disabled', async () => {
    await expect(
      startMqttConnection({ ...enabledConfig, enabled: false }),
    ).resolves.toEqual({ connected: false, skipped: true });

    expect(nativeModules.MqttClient?.connect).not.toHaveBeenCalled();
  });

  it('passes enabled config to the native MQTT bridge', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 4, 23, 10, 11, 12, 345));

    await expect(startMqttConnection(enabledConfig)).resolves.toEqual({
      connected: true,
      clientId: `${Platform.OS}_101112345`,
    });

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledWith({
      ...enabledConfig,
      clientId: `${Platform.OS}_101112345`,
    });
  });

  it('reuses an in-flight connection attempt', async () => {
    let resolveConnect: (value: { connected: boolean }) => void = () => {};
    const connectPromise = new Promise<{ connected: boolean }>(resolve => {
      resolveConnect = resolve;
    });
    nativeModules.MqttClient?.connect.mockReturnValue(connectPromise);

    const firstConnection = startMqttConnection(enabledConfig);
    const secondConnection = startMqttConnection(enabledConfig);

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(1);
    expect(firstConnection).toBe(secondConnection);

    resolveConnect({ connected: true });

    await expect(firstConnection).resolves.toEqual({ connected: true });
  });

  it('reuses an established connection', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 4, 23, 10, 11, 12, 345));

    const firstConnection = await startMqttConnection(enabledConfig);
    const secondConnection = await startMqttConnection(enabledConfig);

    expect(firstConnection).toEqual({
      connected: true,
      clientId: `${Platform.OS}_101112345`,
    });
    expect(secondConnection).toEqual({
      connected: true,
      clientId: `${Platform.OS}_101112345`,
    });
    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledWith({
      ...enabledConfig,
      clientId: `${Platform.OS}_101112345`,
    });
  });

  it('allows retry after a failed connection attempt', async () => {
    nativeModules.MqttClient?.connect
      .mockRejectedValueOnce(new Error('TLS handshake failed'))
      .mockResolvedValueOnce({ connected: true });

    await expect(startMqttConnection(enabledConfig)).rejects.toThrow(
      'TLS handshake failed',
    );
    await expect(startMqttConnection(enabledConfig)).resolves.toEqual({
      connected: true,
    });

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnects through the native MQTT bridge', async () => {
    await expect(stopMqttConnection()).resolves.toEqual({ connected: false });

    expect(nativeModules.MqttClient?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('waits for an in-flight connection before disconnecting', async () => {
    let resolveConnect: (value: { connected: boolean }) => void = () => {};
    nativeModules.MqttClient?.connect.mockReturnValue(
      new Promise<{ connected: boolean }>(resolve => {
        resolveConnect = resolve;
      }),
    );

    const connection = startMqttConnection(enabledConfig);
    const disconnection = stopMqttConnection();

    await Promise.resolve();
    expect(nativeModules.MqttClient?.disconnect).not.toHaveBeenCalled();

    resolveConnect({ connected: true });
    await connection;
    await expect(disconnection).resolves.toEqual({ connected: false });
    expect(nativeModules.MqttClient?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('publishes a message through the native MQTT bridge', async () => {
    await expect(publishMqttMessage('android', 'hello')).resolves.toEqual({
      published: true,
      topic: 'android',
      message: 'hello',
    });

    expect(nativeModules.MqttClient?.publish).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.publish).toHaveBeenCalledWith({
      topic: 'android',
      message: 'hello',
    });
  });

  it('subscribes to a selected device topic through the native bridge', async () => {
    await expect(subscribeMqttTopic('DEV-001')).resolves.toEqual({
      subscribed: true,
      topic: 'DEV-001',
    });

    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledWith({
      topic: 'DEV-001',
    });
  });

  it('does not subscribe twice to the same device topic', async () => {
    await subscribeMqttTopic('DEV-001');
    await subscribeMqttTopic('DEV-001');

    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.unsubscribe).not.toHaveBeenCalled();
  });

  it('unsubscribes the previous device before subscribing to a new one', async () => {
    await subscribeMqttTopic('DEV-001');
    await subscribeMqttTopic('DEV-002');

    expect(nativeModules.MqttClient?.unsubscribe).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.unsubscribe).toHaveBeenCalledWith({
      topic: 'DEV-001',
    });
    expect(nativeModules.MqttClient?.subscribe).toHaveBeenNthCalledWith(2, {
      topic: 'DEV-002',
    });
    expect(
      nativeModules.MqttClient?.unsubscribe.mock.invocationCallOrder[0],
    ).toBeLessThan(
      nativeModules.MqttClient?.subscribe.mock.invocationCallOrder[1] || 0,
    );
  });

  it('unsubscribes the active device topic', async () => {
    await subscribeMqttTopic('DEV-001');

    await expect(unsubscribeMqttTopic('DEV-001')).resolves.toEqual({
      unsubscribed: true,
      topic: 'DEV-001',
    });
    expect(nativeModules.MqttClient?.unsubscribe).toHaveBeenCalledWith({
      topic: 'DEV-001',
    });
  });
});
