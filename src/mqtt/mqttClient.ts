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
};

const MQTT_MESSAGE_EVENT = 'MqttMessageReceived';

let connectPromise: Promise<{ connected: boolean; clientId?: string }> | null =
  null;

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

  //// console.log('[MQTT] Getting native MQTT client');
  const mqttClient = getNativeMqttClient();
  //console.log('[MQTT] Native MQTT client found', Boolean(mqttClient));

  if (!mqttClient) {
    console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
    return Promise.reject(
      new Error(`MQTT native module is not available on ${Platform.OS}`),
    );
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
        return result;
      })
      .catch(error => {
        console.warn('[MQTT] Native connect failed', error);
        //console.log('[MQTT] Clearing connect promise after failure');
        connectPromise = null;
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
  //console.log('[MQTT] stopMqttConnection called');
  //console.log('[MQTT] Clearing connect promise before disconnect');
  connectPromise = null;

  //console.log('[MQTT] Getting native MQTT client for disconnect');
  const mqttClient = getNativeMqttClient();
  console.log(
    '[MQTT] Native MQTT client found for disconnect',
    Boolean(mqttClient),
  );

  if (!mqttClient) {
    //console.log('[MQTT] Disconnect skipped because native module is missing');
    return Promise.resolve({ connected: false, skipped: true });
  }

  //console.log('[MQTT] Calling native disconnect');
  return mqttClient.disconnect().then(result => {
    //console.log('[MQTT] Native disconnect resolved', result);
    return result;
  });
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
  topic: string = 'ev/#',
): Promise<{ subscribed: boolean; topic: string }> {
  const mqttClient = getNativeMqttClient();

  if (!mqttClient) {
    console.warn('[MQTT] Native MQTT module is not available', Platform.OS);
    return Promise.reject(
      new Error(`MQTT native module is not available on ${Platform.OS}`),
    );
  }

  if (typeof mqttClient.subscribe !== 'function') {
    console.warn(
      '[MQTT] Native MQTT subscribe method is not available',
      Platform.OS,
      Object.keys(mqttClient),
    );
    return Promise.reject(
      new Error(
        `MQTT native subscribe method is not available on ${Platform.OS}. Rebuild and reinstall the app.`,
      ),
    );
  }

  console.log(Platform.OS, 'MQTT subscribe request', { topic });
  return mqttClient.subscribe({ topic });
}

export function addMqttMessageListener(
  listener: (message: MqttMessage) => void,
): EmitterSubscription {
  return DeviceEventEmitter.addListener(MQTT_MESSAGE_EVENT, listener);
}
