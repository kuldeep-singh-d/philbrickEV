import {NativeModules, Platform} from 'react-native';
import {
  publishMqttMessage,
  startMqttConnection,
  stopMqttConnection,
  subscribeMqttTopic,
} from '../src/mqtt/mqttClient';
import type {MqttConfig} from '../src/mqtt/mqttConfig';

const nativeModules = NativeModules as {
  MqttClient?: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    publish: jest.Mock;
    subscribe: jest.Mock;
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
        Promise.resolve({connected: true, clientId: config.clientId}),
      ),
      disconnect: jest.fn().mockResolvedValue({connected: false}),
      publish: jest.fn(options =>
        Promise.resolve({published: true, ...options}),
      ),
      subscribe: jest.fn(options =>
        Promise.resolve({subscribed: true, ...options}),
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
      startMqttConnection({...enabledConfig, enabled: false}),
    ).resolves.toEqual({connected: false, skipped: true});

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
    let resolveConnect: (value: {connected: boolean}) => void = () => {};
    const connectPromise = new Promise<{connected: boolean}>(resolve => {
      resolveConnect = resolve;
    });
    nativeModules.MqttClient?.connect.mockReturnValue(connectPromise);

    const firstConnection = startMqttConnection(enabledConfig);
    const secondConnection = startMqttConnection(enabledConfig);

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(1);
    expect(firstConnection).toBe(secondConnection);

    resolveConnect({connected: true});

    await expect(firstConnection).resolves.toEqual({connected: true});
  });

  it('creates a new client ID after each completed connection', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 4, 23, 10, 11, 12, 345));

    await expect(startMqttConnection(enabledConfig)).resolves.toEqual({
      connected: true,
      clientId: `${Platform.OS}_101112345`,
    });

    jest.setSystemTime(new Date(2026, 4, 23, 10, 11, 12, 678));

    await expect(startMqttConnection(enabledConfig)).resolves.toEqual({
      connected: true,
      clientId: `${Platform.OS}_101112678`,
    });

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(2);
    expect(nativeModules.MqttClient?.connect).toHaveBeenNthCalledWith(1, {
      ...enabledConfig,
      clientId: `${Platform.OS}_101112345`,
    });
    expect(nativeModules.MqttClient?.connect).toHaveBeenNthCalledWith(2, {
      ...enabledConfig,
      clientId: `${Platform.OS}_101112678`,
    });
  });

  it('allows retry after a failed connection attempt', async () => {
    nativeModules.MqttClient?.connect
      .mockRejectedValueOnce(new Error('TLS handshake failed'))
      .mockResolvedValueOnce({connected: true});

    await expect(startMqttConnection(enabledConfig)).rejects.toThrow(
      'TLS handshake failed',
    );
    await expect(startMqttConnection(enabledConfig)).resolves.toEqual({
      connected: true,
    });

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnects through the native MQTT bridge', async () => {
    await expect(stopMqttConnection()).resolves.toEqual({connected: false});

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

  it('subscribes to a topic through the native MQTT bridge', async () => {
    await expect(subscribeMqttTopic('ev/#')).resolves.toEqual({
      subscribed: true,
      topic: 'ev/#',
    });

    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledTimes(1);
    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledWith({
      topic: 'ev/#',
    });
  });
});
