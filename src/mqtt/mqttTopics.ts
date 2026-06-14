export interface DeviceMqttTopics {
  deviceId: string;
  publish: {
    requestId: string;
    remoteStart: string;
    remoteStop: string;
    errorAck: string;
    setCurrent: string;
  };
  subscribe: {
    legacyStatus: string;
    responseId: string;
    remoteStartAck: string;
    remoteStopAck: string;
    status: string;
    error: string;
  };
  subscriptionTopics: string[];
}

const appendTopic = (deviceId: string, suffix: string) =>
  `${deviceId}/philbrickev/ac/${suffix}`;

export const createDeviceMqttTopics = (
  deviceId?: string | null,
): DeviceMqttTopics | null => {
  const normalizedDeviceId = deviceId?.trim();

  if (!normalizedDeviceId) {
    return null;
  }

  const publish = {
    requestId: appendTopic(normalizedDeviceId, 'phone/requestid'),
    remoteStart: appendTopic(normalizedDeviceId, 'phone/remotestart'),
    remoteStop: appendTopic(normalizedDeviceId, 'phone/remotestop'),
    errorAck: appendTopic(normalizedDeviceId, 'phone/error'),
    setCurrent: appendTopic(normalizedDeviceId, 'phone/setcurrent'),
  };
  const subscribe = {
    legacyStatus: normalizedDeviceId,
    responseId: appendTopic(normalizedDeviceId, 'phone/responseid'),
    remoteStartAck: appendTopic(normalizedDeviceId, 'evse/ack/remotestart'),
    remoteStopAck: appendTopic(normalizedDeviceId, 'evse/ack/remotestop'),
    status: appendTopic(normalizedDeviceId, 'evse/status'),
    error: appendTopic(normalizedDeviceId, 'evse/error'),
  };

  return {
    deviceId: normalizedDeviceId,
    publish,
    subscribe,
    subscriptionTopics: Object.values(subscribe),
  };
};

export const mqttPayloads = {
  requestId: () => JSON.stringify({ request: 1 }),
  remoteStart: () => JSON.stringify({ start: 1 }),
  remoteStop: () => JSON.stringify({ stop: 1 }),
  errorAck: () => JSON.stringify({ error: 'ok' }),
  setCurrent: (current: number) => JSON.stringify({ setCurrent: current }),
};
