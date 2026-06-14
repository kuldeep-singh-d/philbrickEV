import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { mqttConfig, type MqttConfig } from '../mqtt/mqttConfig';
import {
  addMqttMessageListener,
  publishMqttMessage,
  startMqttConnection,
  stopMqttConnection,
  subscribeMqttTopic,
  subscribeMqttTopics,
  unsubscribeMqttTopic,
  unsubscribeMqttTopics,
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
type MqttUnsubscribeResult = Awaited<ReturnType<typeof unsubscribeMqttTopic>>;
type MqttPublishResult = Awaited<ReturnType<typeof publishMqttMessage>>;

export interface UseMqttOptions {
  config?: MqttConfig;
  defaultTopic?: string;
  autoConnect?: boolean;
  autoSubscribeTopic?: string;
  autoSubscribeTopics?: readonly string[];
  autoRetryCount?: number;
  retryDelayMs?: number;
  disconnectOnUnmount?: boolean;
  onMessage?: (message: MqttMessage) => void;
}

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

const wait = (milliseconds: number) =>
  new Promise<void>(resolve => setTimeout(resolve, milliseconds));

export const useMqtt = ({
  config = mqttConfig,
  defaultTopic,
  autoConnect = false,
  autoSubscribeTopic,
  autoSubscribeTopics = [],
  autoRetryCount = 0,
  retryDelayMs = 500,
  disconnectOnUnmount = false,
  onMessage,
}: UseMqttOptions = {}) => {
  const mountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);
  const autoFlowIdRef = useRef(0);

  const [status, setStatus] = useState<MqttConnectionStatus>('idle');
  const [latestMessage, setLatestMessage] = useState<MqttMessage | null>(null);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const autoTopicsKey = useMemo(
    () =>
      [...autoSubscribeTopics, autoSubscribeTopic]
        .filter((topic): topic is string => Boolean(topic?.trim()))
        .map(topic => topic.trim())
        .filter((topic, index, topics) => topics.indexOf(topic) === index)
        .join('\n'),
    [autoSubscribeTopic, autoSubscribeTopics],
  );
  const normalizedAutoTopics = useMemo(
    () => (autoTopicsKey ? autoTopicsKey.split('\n') : []),
    [autoTopicsKey],
  );

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(
    async (nextConfig: MqttConfig = config): Promise<MqttConnectionResult> => {
      setStatus('connecting');
      setError('');

      try {
        const result = await startMqttConnection(nextConfig);

        if (mountedRef.current) {
          setStatus(result.connected ? 'connected' : 'skipped');
        }

        return result;
      } catch (connectionError) {
        if (mountedRef.current) {
          setStatus('error');
          setError(getErrorMessage(connectionError));
        }

        throw connectionError;
      }
    },
    [config],
  );

  const disconnect = useCallback(async (): Promise<MqttDisconnectResult> => {
    setError('');

    try {
      const result = await stopMqttConnection();

      if (mountedRef.current) {
        setStatus(result.connected ? 'connected' : 'disconnected');

        if (!result.connected) {
          setSubscribedTopics([]);
        }
      }

      return result;
    } catch (disconnectError) {
      if (mountedRef.current) {
        setStatus('error');
        setError(getErrorMessage(disconnectError));
      }

      throw disconnectError;
    }
  }, []);

  const subscribe = useCallback(
    async (topic?: string): Promise<MqttSubscribeResult> => {
      const nextTopic = topic || defaultTopic;

      if (!nextTopic) {
        throw new Error('MQTT subscribe topic is required');
      }

      setError('');

      try {
        const result = await subscribeMqttTopic(nextTopic);

        if (mountedRef.current) {
          setSubscribedTopics(current =>
            current.includes(result.topic)
              ? current
              : [...current, result.topic],
          );
        }

        return result;
      } catch (subscribeError) {
        if (mountedRef.current) {
          setError(getErrorMessage(subscribeError));
        }

        throw subscribeError;
      }
    },
    [defaultTopic],
  );

  const subscribeMany = useCallback(async (topics: readonly string[]) => {
    setError('');

    try {
      const result = await subscribeMqttTopics(topics);

      if (mountedRef.current) {
        setSubscribedTopics(current => [
          ...new Set([...current, ...result.topics]),
        ]);
      }

      return result;
    } catch (subscribeError) {
      if (mountedRef.current) {
        setError(getErrorMessage(subscribeError));
      }

      throw subscribeError;
    }
  }, []);

  const unsubscribe = useCallback(
    async (topic?: string): Promise<MqttUnsubscribeResult> => {
      const nextTopic = topic || subscribedTopics[0];

      if (!nextTopic) {
        throw new Error('MQTT unsubscribe topic is required');
      }

      setError('');

      try {
        const result = await unsubscribeMqttTopic(nextTopic);

        if (mountedRef.current && result.unsubscribed) {
          setSubscribedTopics(current =>
            current.filter(activeTopic => activeTopic !== result.topic),
          );
        }

        return result;
      } catch (unsubscribeError) {
        if (mountedRef.current) {
          setError(getErrorMessage(unsubscribeError));
        }

        throw unsubscribeError;
      }
    },
    [subscribedTopics],
  );

  const unsubscribeMany = useCallback(async (topics: readonly string[]) => {
    setError('');

    try {
      const result = await unsubscribeMqttTopics(topics);

      if (mountedRef.current) {
        const removedTopics = new Set(result.topics);
        setSubscribedTopics(current =>
          current.filter(topic => !removedTopics.has(topic)),
        );
      }

      return result;
    } catch (unsubscribeError) {
      if (mountedRef.current) {
        setError(getErrorMessage(unsubscribeError));
      }

      throw unsubscribeError;
    }
  }, []);

  const publish = useCallback(
    async (topic?: string, message?: string): Promise<MqttPublishResult> => {
      setError('');

      try {
        return await publishMqttMessage(topic, message);
      } catch (publishError) {
        if (mountedRef.current) {
          setStatus('error');
          setError(getErrorMessage(publishError));
        }

        throw publishError;
      }
    },
    [],
  );

  const retry = useCallback(() => {
    setRetryKey(value => value + 1);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const subscription = addMqttMessageListener(message => {
      if (mountedRef.current) {
        setLatestMessage(message);
      }

      onMessageRef.current?.(message);
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();

      if (disconnectOnUnmount) {
        stopMqttConnection().catch(disconnectError => {
          logMqtt('cleanup disconnect failed', disconnectError);
        });
      }
    };
  }, [disconnectOnUnmount]);

  useEffect(() => {
    if (!autoConnect) {
      setIsInitializing(false);
      return;
    }

    const flowId = autoFlowIdRef.current + 1;
    autoFlowIdRef.current = flowId;
    let cancelled = false;

    const runAutoFlow = async () => {
      if (mountedRef.current) {
        setIsInitializing(true);
        setError('');
        setLatestMessage(null);
      }

      for (let attempt = 0; attempt <= autoRetryCount; attempt += 1) {
        try {
          const result = await connect();

          if (!result.connected) {
            throw new Error('MQTT connection is not enabled');
          }

          if (cancelled || autoFlowIdRef.current !== flowId) {
            return;
          }

          if (normalizedAutoTopics.length > 0) {
            await subscribeMany(normalizedAutoTopics);
          }

          if (
            !cancelled &&
            mountedRef.current &&
            autoFlowIdRef.current === flowId
          ) {
            setStatus('connected');
            setError('');
            setIsInitializing(false);
          }
          return;
        } catch (autoConnectError) {
          const isFinalAttempt = attempt >= autoRetryCount;

          if (
            isFinalAttempt &&
            !cancelled &&
            mountedRef.current &&
            autoFlowIdRef.current === flowId
          ) {
            setStatus('error');
            setError(getErrorMessage(autoConnectError));
            setIsInitializing(false);
            return;
          }

          await stopMqttConnection().catch(disconnectError => {
            logMqtt('retry disconnect failed', disconnectError);
          });

          if (retryDelayMs > 0) {
            await wait(retryDelayMs);
          }

          if (cancelled || autoFlowIdRef.current !== flowId) {
            return;
          }
        }
      }
    };

    runAutoFlow().catch(autoFlowError => {
      logMqtt('auto connection flow failed', autoFlowError);
    });

    return () => {
      cancelled = true;

      if (normalizedAutoTopics.length > 0) {
        unsubscribeMqttTopics(normalizedAutoTopics).catch(unsubscribeError => {
          logMqtt('auto topic cleanup failed', unsubscribeError);
        });
      }
    };
  }, [
    autoConnect,
    autoRetryCount,
    connect,
    normalizedAutoTopics,
    retryDelayMs,
    retryKey,
    subscribeMany,
  ]);

  return {
    status,
    error,
    isConnected: status === 'connected' && !isInitializing,
    isInitializing,
    latestMessage,
    subscribedTopic: subscribedTopics[0] || '',
    subscribedTopics,
    connect,
    disconnect,
    subscribe,
    subscribeMany,
    unsubscribe,
    unsubscribeMany,
    publish,
    retry,
  };
};

export default useMqtt;
