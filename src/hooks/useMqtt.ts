import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { mqttConfig, type MqttConfig } from '../mqtt/mqttConfig';
import {
  addMqttMessageListener,
  publishMqttMessage,
  startMqttConnection,
  stopMqttConnection,
  subscribeMqttTopic,
  type MqttMessage,
} from '../mqtt/mqttClient';

export type MqttConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'skipped'
  | 'error';

type MqttConnectionResult = Awaited<ReturnType<typeof startMqttConnection>>;
type MqttDisconnectResult = Awaited<ReturnType<typeof stopMqttConnection>>;
type MqttSubscribeResult = Awaited<ReturnType<typeof subscribeMqttTopic>>;
type MqttPublishResult = Awaited<ReturnType<typeof publishMqttMessage>>;

export interface UseMqttOptions {
  config?: MqttConfig;
  defaultTopic?: string;
  autoConnect?: boolean;
  autoSubscribeTopic?: string;
  disconnectOnUnmount?: boolean;
  onMessage?: (message: MqttMessage) => void;
}

const DEFAULT_TOPIC = 'ev/#';
const LOG_PREFIX = '[MQTT hook]';

const logMqtt = (label: string, payload?: unknown) => {
  if (payload === undefined) {
    console.log(Platform.OS, LOG_PREFIX, label);
    return;
  }

  console.log(Platform.OS, LOG_PREFIX, label, payload);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'MQTT request failed';
};

export const useMqtt = ({
  config = mqttConfig,
  defaultTopic = DEFAULT_TOPIC,
  autoConnect = false,
  autoSubscribeTopic,
  disconnectOnUnmount = false,
  onMessage,
}: UseMqttOptions = {}) => {
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<MqttConnectionStatus>('idle');
  const [latestMessage, setLatestMessage] = useState<MqttMessage | null>(null);
  const [subscribedTopic, setSubscribedTopic] = useState('');
  const [error, setError] = useState('');

  const connect = useCallback(
    async (nextConfig: MqttConfig = config): Promise<MqttConnectionResult> => {
      logMqtt('connect requested', {
        enabled: nextConfig.enabled,
        host: nextConfig.host,
        port: nextConfig.port,
        cleanSession: nextConfig.cleanSession,
        keepAliveSeconds: nextConfig.keepAliveSeconds,
      });
      setStatus('connecting');
      logMqtt('status changed', 'connecting');
      setError('');

      try {
        const result = await startMqttConnection(nextConfig);

        if (mountedRef.current) {
          const nextStatus = result.connected ? 'connected' : 'skipped';
          setStatus(nextStatus);
          logMqtt('status changed', nextStatus);
        }

        logMqtt('connection result', result);
        return result;
      } catch (connectionError) {
        if (mountedRef.current) {
          setStatus('error');
          logMqtt('status changed', 'error');
          setError(getErrorMessage(connectionError));
        }

        logMqtt('connection failed', connectionError);
        throw connectionError;
      }
    },
    [config],
  );

  const disconnect = useCallback(async (): Promise<MqttDisconnectResult> => {
    logMqtt('disconnect requested');
    setError('');

    try {
      const result = await stopMqttConnection();

      if (mountedRef.current) {
        let nextStatus: MqttConnectionStatus = 'disconnected';

        if (result.connected) {
          nextStatus = 'connected';
        } else if ('skipped' in result && result.skipped) {
          nextStatus = 'skipped';
        }

        setStatus(nextStatus);
        logMqtt('status changed', nextStatus);
        if (!result.connected) {
          setSubscribedTopic('');
          logMqtt('subscribed topic cleared');
        }
      }

      logMqtt('disconnect result', result);
      return result;
    } catch (disconnectError) {
      if (mountedRef.current) {
        setStatus('error');
        logMqtt('status changed', 'error');
        setError(getErrorMessage(disconnectError));
      }

      logMqtt('disconnect failed', disconnectError);
      throw disconnectError;
    }
  }, []);

  const subscribe = useCallback(
    async (topic: string = defaultTopic): Promise<MqttSubscribeResult> => {
      logMqtt('subscribe requested', { topic });
      setError('');

      try {
        const result = await subscribeMqttTopic(topic);

        if (mountedRef.current) {
          setSubscribedTopic(result.topic);
          logMqtt('subscribed topic changed', result.topic);
        }

        logMqtt('subscribe result', result);
        return result;
      } catch (subscribeError) {
        if (mountedRef.current) {
          setError(getErrorMessage(subscribeError));
        }

        logMqtt('subscribe failed', subscribeError);
        throw subscribeError;
      }
    },
    [defaultTopic],
  );

  const publish = useCallback(
    async (
      topic?: string,
      message?: string,
    ): Promise<MqttPublishResult> => {
      logMqtt('publish requested', { topic, message });
      setError('');

      try {
        const result = await publishMqttMessage(topic, message);
        logMqtt('publish result', result);
        return result;
      } catch (publishError) {
        if (mountedRef.current) {
          setError(getErrorMessage(publishError));
        }

        logMqtt('publish failed', publishError);
        throw publishError;
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    logMqtt('listener registering');

    const subscription = addMqttMessageListener(message => {
      if (mountedRef.current) {
        setLatestMessage(message);
        logMqtt('latest message changed', message);
      }

      logMqtt('message received', message);
      onMessage?.(message);
    });

    logMqtt('listener registered');

    return () => {
      logMqtt('listener cleanup started');
      mountedRef.current = false;
      subscription.remove();
      logMqtt('listener removed');

      if (disconnectOnUnmount) {
        logMqtt('cleanup disconnect requested');
        stopMqttConnection().catch(disconnectError => {
          logMqtt('cleanup disconnect failed', disconnectError);
        });
      }
    };
  }, [disconnectOnUnmount, onMessage]);

  useEffect(() => {
    if (!autoConnect) {
      logMqtt('auto connect disabled');
      return;
    }

    let cancelled = false;

    logMqtt('auto connect started', { autoSubscribeTopic });

    connect()
      .then(result => {
        logMqtt('auto connect completed', result);
        if (
          !cancelled &&
          result.connected &&
          typeof autoSubscribeTopic === 'string'
        ) {
          logMqtt('auto subscribe started', { topic: autoSubscribeTopic });
          return subscribe(autoSubscribeTopic);
        }

        return undefined;
      })
      .then(result => {
        if (result) {
          logMqtt('auto subscribe completed', result);
        }
      })
      .catch(autoConnectError => {
        logMqtt('auto connect flow failed', autoConnectError);
      });

    return () => {
      cancelled = true;
      logMqtt('auto connect effect cleanup');
    };
  }, [autoConnect, autoSubscribeTopic, connect, subscribe]);

  return {
    status,
    error,
    isConnected: status === 'connected',
    latestMessage,
    subscribedTopic,
    connect,
    disconnect,
    subscribe,
    publish,
  };
};

export default useMqtt;
