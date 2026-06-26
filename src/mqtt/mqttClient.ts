import {
  DeviceEventEmitter,
  type EmitterSubscription,
  NativeModules,
  Platform,
} from 'react-native';
import { mqttConfig, type MqttConfig } from './mqttConfig';

export type MqttMessage = {
  topic: string;
  message: string;
};

export type MqttOperation =
  | 'connect'
  | 'disconnect'
  | 'publish'
  | 'subscribe'
  | 'unsubscribe';

export class MqttOperationError extends Error {
  operation: MqttOperation;
  topic?: string;
  userMessage: string;
  originalMessage: string;

  constructor({
    operation,
    topic,
    message,
    userMessage,
  }: {
    operation: MqttOperation;
    topic?: string;
    message: string;
    userMessage: string;
  }) {
    super(message);
    this.name = 'MqttOperationError';
    this.operation = operation;
    this.topic = topic;
    this.userMessage = userMessage;
    this.originalMessage = message;
  }
}

type NativeMqttClient = {
  connect(
    options: MqttConfig,
  ): Promise<{ connected: boolean; clientId?: string }>;
  disconnect(): Promise<{ connected: boolean }>;
  publish(options: {
    topic: string;
    message: string;
  }): Promise<{ published: boolean; topic: string; message: string }>;
  subscribe?(options: {
    topic: string;
  }): Promise<{ subscribed: boolean; topic: string }>;
  unsubscribe?(options: {
    topic: string;
  }): Promise<{ unsubscribed: boolean; topic: string }>;
};

const MQTT_MESSAGE_EVENT = 'MqttMessageReceived';
const MQTT_CONNECT_TIMEOUT_MS = 18_000;
const MQTT_USER_MESSAGES: Record<MqttOperation, string> = {
  connect:
    'Unable to connect to your charger right now. Please check your internet connection and try again.',
  disconnect: 'Unable to close the charger connection. Please try again.',
  publish: 'Unable to send your request to the charger. Please try again.',
  subscribe:
    'Connected to the charger, but live updates could not be started. Please try again.',
  unsubscribe: 'Unable to update charger live updates. Please try again.',
};

let connectPromise: Promise<{ connected: boolean; clientId?: string }> | null =
  null;
let disconnectPromise: Promise<
  { connected: boolean } | { connected: false; skipped: true }
> | null = null;
let activeConnection: { connected: boolean; clientId?: string } | undefined;
let activeConnectionKey = '';
const activeSubscribedTopics = new Set<string>();
let subscriptionQueue: Promise<void> = Promise.resolve();

function clearActiveConnectionState() {
  activeConnection = undefined;
  activeConnectionKey = '';
  activeSubscribedTopics.clear();
}

function getNativeMqttClient(): NativeMqttClient | undefined {
  const mqttClient = NativeModules.MqttClient as NativeMqttClient | undefined;
  return mqttClient;
}

function padTimePart(value: number, length: number) {
  return String(value).padStart(length, '0');
}

function createMqttClientId() {
  const now = new Date();
  const timestamp = [
    padTimePart(now.getHours(), 2),
    padTimePart(now.getMinutes(), 2),
    padTimePart(now.getSeconds(), 2),
    padTimePart(now.getMilliseconds(), 3),
  ].join('');

  return `${Platform.OS}_${timestamp}`;
}

function getConnectionKey(config: MqttConfig) {
  return JSON.stringify({
    enabled: config.enabled,
    host: config.host,
    port: config.port,
    cleanSession: config.cleanSession,
    keepAliveSeconds: config.keepAliveSeconds,
    username: config.username,
    password: config.password,
    certificate: config.certificate,
  });
}

function enqueueSubscription<T>(operation: () => Promise<T>): Promise<T> {
  const result = subscriptionQueue.then(operation, operation);
  subscriptionQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

function requireTopic(topic: string, action: string) {
  const normalizedTopic = topic.trim();

  if (!normalizedTopic) {
    throw new Error(`MQTT ${action} topic is required`);
  }

  return normalizedTopic;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown MQTT error';
}

export function getMqttUserMessage(error: unknown) {
  if (error instanceof MqttOperationError) {
    return error.userMessage;
  }

  return 'Unable to connect to the selected charger. Please try again.';
}

export function getMqttErrorDetails(error: unknown) {
  if (error instanceof MqttOperationError) {
    return {
      operation: error.operation,
      topic: error.topic,
      message: error.originalMessage,
      userMessage: error.userMessage,
    };
  }

  return {
    message: getErrorMessage(error),
    userMessage: getMqttUserMessage(error),
  };
}

function createOperationError(
  operation: MqttOperation,
  error: unknown,
  topic?: string,
) {
  if (error instanceof MqttOperationError) {
    return error;
  }

  const reason = getErrorMessage(error);
  const context = topic ? ` topic="${topic}"` : '';

  return new MqttOperationError({
    operation,
    topic,
    message: `MQTT ${operation} failed${context}: ${reason}`,
    userMessage: MQTT_USER_MESSAGES[operation],
  });
}

function normalizeMqttMessage(event: unknown): MqttMessage | null {
  if (!event || typeof event !== 'object') {
    console.warn('[MQTT] invalid message event', event);
    return null;
  }

  const { topic, message } = event as Partial<MqttMessage>;

  if (typeof topic !== 'string' || !topic.trim()) {
    console.warn('[MQTT] message ignored because topic is invalid', event);
    return null;
  }

  if (typeof message !== 'string') {
    console.warn('[MQTT] message ignored because payload is invalid', {
      topic,
      message,
    });
    return null;
  }

  return {
    topic,
    message,
  };
}

export function startMqttConnection(
  config: MqttConfig = mqttConfig,
): Promise<
  | { connected: boolean; clientId?: string }
  | { connected: false; skipped: true }
> {
  if (!config.enabled || !config.host || !config.port) {
    console.log('[MQTT] connection skipped', {
      enabled: config.enabled,
      hasHost: Boolean(config.host),
      port: config.port,
    });
    return Promise.resolve({ connected: false, skipped: true });
  }

  if (disconnectPromise) {
    return disconnectPromise.then(() => startMqttConnection(config));
  }

  const mqttClient = getNativeMqttClient();

  if (!mqttClient) {
    console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
    return Promise.reject(
      createOperationError(
        'connect',
        new Error(`MQTT native module is not available on ${Platform.OS}`),
      ),
    );
  }

  const connectionKey = getConnectionKey(config);

  if (activeConnection?.connected && activeConnectionKey === connectionKey) {
    return Promise.resolve(activeConnection);
  }

  if (!connectPromise) {
    const connectionConfig = {
      ...config,
      clientId: createMqttClientId(),
    };
    console.log('[MQTT] connecting', {
      platform: Platform.OS,
      host: connectionConfig.host,
      port: connectionConfig.port,
      clientId: connectionConfig.clientId,
    });
    connectPromise = withTimeout(
      mqttClient.connect(connectionConfig),
      MQTT_CONNECT_TIMEOUT_MS,
      `MQTT connection timed out after ${MQTT_CONNECT_TIMEOUT_MS / 1000}s`,
    )
      .then(result => {
        console.log('[MQTT] connected', result);
        connectPromise = null;
        activeConnection = result.connected ? result : undefined;
        activeConnectionKey = result.connected ? connectionKey : '';
        activeSubscribedTopics.clear();
        return result;
      })
      .catch(error => {
        const connectionError = createOperationError('connect', error);
        console.warn(
          '[MQTT] native connect failed',
          getMqttErrorDetails(connectionError),
        );
        connectPromise = null;
        clearActiveConnectionState();
        throw connectionError;
      });
  }

  return connectPromise;
}

export function stopMqttConnection(): Promise<
  { connected: boolean } | { connected: false; skipped: true }
> {
  if (disconnectPromise) {
    return disconnectPromise;
  }

  const pendingConnection = connectPromise;
  const operation = enqueueSubscription(async () => {
    if (pendingConnection) {
      await pendingConnection.catch(() => undefined);
    }

    const mqttClient = getNativeMqttClient();

    try {
      if (!mqttClient) {
        return { connected: false as const, skipped: true as const };
      }

      const result = await mqttClient.disconnect();
      return result;
    } finally {
      connectPromise = null;
      clearActiveConnectionState();
    }
  });

  disconnectPromise = operation.finally(() => {
    disconnectPromise = null;
  });
  return disconnectPromise;
}

export function publishMqttMessage(
  topic: string = Platform.OS,
  message: string = `Hello from ${Platform.OS} ${new Date().toISOString()}`,
): Promise<{ published: boolean; topic: string; message: string }> {
  const mqttClient = getNativeMqttClient();

  if (!mqttClient) {
    console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
    return Promise.reject(
      createOperationError(
        'publish',
        new Error(`MQTT native module is not available on ${Platform.OS}`),
        topic,
      ),
    );
  }

  if (typeof mqttClient.publish !== 'function') {
    console.warn(
      '[MQTT] Native MQTT publish method is not available',
      Platform.OS,
      Object.keys(mqttClient),
    );
    return Promise.reject(
      createOperationError(
        'publish',
        new Error(
          `MQTT native publish method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
        ),
        topic,
      ),
    );
  }

  return mqttClient.publish({ topic, message }).catch(error => {
    const publishError = createOperationError('publish', error, topic);
    console.warn('[MQTT] publish failed', getMqttErrorDetails(publishError));
    clearActiveConnectionState();
    throw publishError;
  });
}

export function subscribeMqttTopic(
  topic: string,
): Promise<{ subscribed: boolean; topic: string }> {
  return enqueueSubscription(async () => {
    const normalizedTopic = requireTopic(topic, 'subscribe');
    const mqttClient = getNativeMqttClient();

    if (!mqttClient) {
      console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
      throw createOperationError(
        'subscribe',
        new Error(`MQTT native module is not available on ${Platform.OS}`),
        normalizedTopic,
      );
    }

    if (typeof mqttClient.subscribe !== 'function') {
      console.warn(
        '[MQTT] Native MQTT subscribe method is not available',
        Platform.OS,
        Object.keys(mqttClient),
      );
      throw createOperationError(
        'subscribe',
        new Error(
          `MQTT native subscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
        ),
        normalizedTopic,
      );
    }

    if (activeSubscribedTopics.has(normalizedTopic)) {
      return { subscribed: true, topic: normalizedTopic };
    }

    try {
      const result = await mqttClient.subscribe({ topic: normalizedTopic });
      activeSubscribedTopics.add(result.topic);
      return result;
    } catch (error) {
      const subscribeError = createOperationError(
        'subscribe',
        error,
        normalizedTopic,
      );
      console.warn(
        '[MQTT] subscribe failed',
        getMqttErrorDetails(subscribeError),
      );
      throw subscribeError;
    }
  });
}

export async function subscribeMqttTopics(
  topics: readonly string[],
): Promise<{ subscribed: boolean; topics: string[] }> {
  const uniqueTopics = [
    ...new Set(topics.map(topic => requireTopic(topic, 'subscribe'))),
  ];

  for (const topic of uniqueTopics) {
    await subscribeMqttTopic(topic);
  }

  return { subscribed: true, topics: uniqueTopics };
}

export function unsubscribeMqttTopic(
  topic: string,
): Promise<{ unsubscribed: boolean; topic: string }> {
  return enqueueSubscription(async () => {
    const normalizedTopic = requireTopic(topic, 'unsubscribe');
    const mqttClient = getNativeMqttClient();

    if (!mqttClient) {
      console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
      throw createOperationError(
        'unsubscribe',
        new Error(`MQTT native module is not available on ${Platform.OS}`),
        normalizedTopic,
      );
    }

    if (!activeSubscribedTopics.has(normalizedTopic)) {
      return { unsubscribed: false, topic: normalizedTopic };
    }

    if (typeof mqttClient.unsubscribe !== 'function') {
      console.warn(
        '[MQTT] Native MQTT unsubscribe method is not available',
        Platform.OS,
        Object.keys(mqttClient),
      );
      throw createOperationError(
        'unsubscribe',
        new Error(
          `MQTT native unsubscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
        ),
        normalizedTopic,
      );
    }

    try {
      const result = await mqttClient.unsubscribe({ topic: normalizedTopic });
      activeSubscribedTopics.delete(normalizedTopic);
      return result;
    } catch (error) {
      const unsubscribeError = createOperationError(
        'unsubscribe',
        error,
        normalizedTopic,
      );
      console.warn(
        '[MQTT] unsubscribe failed',
        getMqttErrorDetails(unsubscribeError),
      );
      throw unsubscribeError;
    }
  });
}

export async function unsubscribeMqttTopics(
  topics: readonly string[],
): Promise<{ unsubscribed: boolean; topics: string[] }> {
  const uniqueTopics = [
    ...new Set(topics.map(topic => requireTopic(topic, 'unsubscribe'))),
  ];

  for (const topic of uniqueTopics) {
    await unsubscribeMqttTopic(topic);
  }

  return { unsubscribed: true, topics: uniqueTopics };
}

export function addMqttMessageListener(
  listener: (message: MqttMessage) => void,
): EmitterSubscription {
  return DeviceEventEmitter.addListener(MQTT_MESSAGE_EVENT, event => {
    const message = normalizeMqttMessage(event);

    if (!message) {
      return;
    }

    console.log('[MQTT] received', {
      topic: message.topic,
      message: message.message,
    });

    try {
      listener(message);
    } catch (error) {
      console.warn('[MQTT] message listener failed', getErrorMessage(error));
    }
  });
}
