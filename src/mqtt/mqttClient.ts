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

let connectPromise: Promise<{ connected: boolean; clientId?: string }> | null =
  null;
let disconnectPromise: Promise<
  { connected: boolean } | { connected: false; skipped: true }
> | null = null;
let activeConnection: { connected: boolean; clientId?: string } | undefined;
let activeConnectionKey = '';
let activeSubscribedTopic = '';
let subscriptionQueue: Promise<void> = Promise.resolve();

function getNativeMqttClient(): NativeMqttClient | undefined {
  //// console.log('[MQTT] Reading NativeModules.MqttClient');
  const mqttClient = NativeModules.MqttClient as NativeMqttClient | undefined;
  //// console.log('[MQTT] NativeModules.MqttClient value', mqttClient);
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

function requireTopic(topic: string, action: string) {
  const normalizedTopic = topic.trim();

  if (!normalizedTopic) {
    throw new Error(`MQTT ${action} topic is required`);
  }

  return normalizedTopic;
}

export function startMqttConnection(
  config: MqttConfig = mqttConfig,
): Promise<
  | { connected: boolean; clientId?: string }
  | { connected: false; skipped: true }
> {
  //// console.log('[MQTT] startMqttConnection called');
  if (!config.enabled || !config.host) {
    //// console.log('[MQTT] Connection skipped');
    //// console.log('[MQTT] Skip reason enabled', config.enabled);
    //// console.log('[MQTT] Skip reason host exists', Boolean(config.host));
    return Promise.resolve({ connected: false, skipped: true });
  }

  if (disconnectPromise) {
    return disconnectPromise.then(() => startMqttConnection(config));
  }

  //// console.log('[MQTT] Getting native MQTT client');
  const mqttClient = getNativeMqttClient();
  //console.log('[MQTT] Native MQTT client found', Boolean(mqttClient));

  if (!mqttClient) {
    console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
    return Promise.reject(
      new Error(`MQTT native module is not available on ${Platform.OS}`),
    );
  }

  const connectionKey = getConnectionKey(config);

  if (activeConnection?.connected && activeConnectionKey === connectionKey) {
    return Promise.resolve(activeConnection);
  }

  if (!connectPromise) {
    //console.log('[MQTT] No active connect promise; creating connection');
    const connectionConfig = {
      ...config,
      clientId: createMqttClientId(),
    };
    console.log(Platform.OS, 'MQTT client id', connectionConfig.clientId);
    connectPromise = mqttClient
      .connect(connectionConfig)
      .then(result => {
        //console.log('[MQTT] Native connect resolved', result);
        connectPromise = null;
        activeConnection = result.connected ? result : undefined;
        activeConnectionKey = result.connected ? connectionKey : '';
        activeSubscribedTopic = '';
        return result;
      })
      .catch(error => {
        console.warn('[MQTT] Native connect failed', error);
        //console.log('[MQTT] Clearing connect promise after failure');
        connectPromise = null;
        activeConnection = undefined;
        activeConnectionKey = '';
        activeSubscribedTopic = '';
        throw error;
      });
  } else {
    //console.log('[MQTT] Reusing existing connect promise');
  }

  //console.log('[MQTT] Returning connect promise');
  return connectPromise;
}

export function stopMqttConnection(): Promise<
  { connected: boolean } | { connected: false; skipped: true }
> {
  if (disconnectPromise) {
    return disconnectPromise;
  }

  //console.log('[MQTT] stopMqttConnection called');
  const pendingConnection = connectPromise;
  const operation = enqueueSubscription(async () => {
    if (pendingConnection) {
      await pendingConnection.catch(() => undefined);
    }

    //console.log('[MQTT] Getting native MQTT client for disconnect');
    const mqttClient = getNativeMqttClient();
    console.log(
      '[MQTT] Native MQTT client found for disconnect',
      Boolean(mqttClient),
    );

    try {
      if (!mqttClient) {
        //console.log('[MQTT] Disconnect skipped because native module is missing');
        return { connected: false as const, skipped: true as const };
      }

      //console.log('[MQTT] Calling native disconnect');
      const result = await mqttClient.disconnect();
      //console.log('[MQTT] Native disconnect resolved', result);
      return result;
    } finally {
      connectPromise = null;
      activeConnection = undefined;
      activeConnectionKey = '';
      activeSubscribedTopic = '';
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
      new Error(`MQTT native module is not available on ${Platform.OS}`),
    );
  }

  if (typeof mqttClient.publish !== 'function') {
    console.warn(
      '[MQTT] Native MQTT publish method is not available',
      Platform.OS,
      Object.keys(mqttClient),
    );
    return Promise.reject(
      new Error(
        `MQTT native publish method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
      ),
    );
  }

  console.log(Platform.OS, 'MQTT publish request', { topic, message });
  return mqttClient.publish({ topic, message });
}

export function subscribeMqttTopic(
  topic: string,
): Promise<{ subscribed: boolean; topic: string }> {
  return enqueueSubscription(async () => {
    const normalizedTopic = requireTopic(topic, 'subscribe');
    const mqttClient = getNativeMqttClient();

    if (!mqttClient) {
      console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
      throw new Error(`MQTT native module is not available on ${Platform.OS}`);
    }

    if (typeof mqttClient.subscribe !== 'function') {
      console.warn(
        '[MQTT] Native MQTT subscribe method is not available',
        Platform.OS,
        Object.keys(mqttClient),
      );
      throw new Error(
        `MQTT native subscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
      );
    }

    if (activeSubscribedTopic === normalizedTopic) {
      return { subscribed: true, topic: normalizedTopic };
    }

    if (activeSubscribedTopic) {
      if (typeof mqttClient.unsubscribe !== 'function') {
        throw new Error(
          `MQTT native unsubscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
        );
      }

      const previousTopic = activeSubscribedTopic;
      console.log(Platform.OS, 'MQTT unsubscribe request', {
        topic: previousTopic,
      });
      await mqttClient.unsubscribe({ topic: previousTopic });
      activeSubscribedTopic = '';
    }

    console.log(Platform.OS, 'MQTT subscribe request', {
      topic: normalizedTopic,
    });
    const result = await mqttClient.subscribe({ topic: normalizedTopic });
    activeSubscribedTopic = result.topic;
    return result;
  });
}

export function unsubscribeMqttTopic(
  topic: string,
): Promise<{ unsubscribed: boolean; topic: string }> {
  return enqueueSubscription(async () => {
    const normalizedTopic = requireTopic(topic, 'unsubscribe');
    const mqttClient = getNativeMqttClient();

    if (!mqttClient) {
      console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
      throw new Error(`MQTT native module is not available on ${Platform.OS}`);
    }

    if (activeSubscribedTopic !== normalizedTopic) {
      return { unsubscribed: false, topic: normalizedTopic };
    }

    if (typeof mqttClient.unsubscribe !== 'function') {
      console.warn(
        '[MQTT] Native MQTT unsubscribe method is not available',
        Platform.OS,
        Object.keys(mqttClient),
      );
      throw new Error(
        `MQTT native unsubscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
      );
    }

    console.log(Platform.OS, 'MQTT unsubscribe request', {
      topic: normalizedTopic,
    });
    const result = await mqttClient.unsubscribe({ topic: normalizedTopic });
    activeSubscribedTopic = '';
    return result;
  });
}

export function addMqttMessageListener(
  listener: (message: MqttMessage) => void,
): EmitterSubscription {
  return DeviceEventEmitter.addListener(MQTT_MESSAGE_EVENT, listener);
}
