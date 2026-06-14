import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NativeModules } from 'react-native';

import { useMqtt } from '../src/hooks/useMqtt';
import { stopMqttConnection } from '../src/mqtt/mqttClient';

const nativeModules = NativeModules as {
  MqttClient?: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    publish: jest.Mock;
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
  };
};

describe('useMqtt automatic connection flow', () => {
  beforeEach(() => {
    nativeModules.MqttClient = {
      connect: jest
        .fn()
        .mockRejectedValueOnce(new Error('offline'))
        .mockRejectedValueOnce(new Error('still offline'))
        .mockResolvedValue({ connected: true }),
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
    jest.clearAllMocks();
  });

  it('retries twice and becomes ready only after every topic is subscribed', async () => {
    let mqttState: ReturnType<typeof useMqtt> | undefined;

    const Harness = () => {
      mqttState = useMqtt({
        autoConnect: true,
        autoSubscribeTopics: ['status', 'error'],
        autoRetryCount: 2,
        retryDelayMs: 0,
      });
      return null;
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<Harness />);

      for (let index = 0; index < 12; index += 1) {
        await Promise.resolve();
      }
    });

    expect(nativeModules.MqttClient?.connect).toHaveBeenCalledTimes(3);
    expect(nativeModules.MqttClient?.subscribe).toHaveBeenCalledTimes(2);
    expect(mqttState?.isInitializing).toBe(false);
    expect(mqttState?.isConnected).toBe(true);
    expect(mqttState?.subscribedTopics).toEqual(['status', 'error']);

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
