import { createDeviceMqttTopics, mqttPayloads } from '../src/mqtt/mqttTopics';

describe('device MQTT topics', () => {
  it('builds the required publish and subscription topics', () => {
    const topics = createDeviceMqttTopics(' DEV-001 ');

    expect(topics).toEqual({
      deviceId: 'DEV-001',
      publish: {
        requestId: 'DEV-001/philbrickev/ac/phone/requestid',
        remoteStart: 'DEV-001/philbrickev/ac/phone/remotestart',
        remoteStop: 'DEV-001/philbrickev/ac/phone/remotestop',
        errorAck: 'DEV-001/philbrickev/ac/phone/error',
        setCurrent: 'DEV-001/philbrickev/ac/phone/setcurrent',
      },
      subscribe: {
        legacyStatus: 'DEV-001',
        responseId: 'DEV-001/philbrickev/ac/phone/responseid',
        remoteStartAck: 'DEV-001/philbrickev/ac/evse/ack/remotestart',
        remoteStopAck: 'DEV-001/philbrickev/ac/evse/ack/remotestop',
        status: 'DEV-001/philbrickev/ac/evse/status',
        error: 'DEV-001/philbrickev/ac/evse/error',
      },
      subscriptionTopics: [
        'DEV-001',
        'DEV-001/philbrickev/ac/phone/responseid',
        'DEV-001/philbrickev/ac/evse/ack/remotestart',
        'DEV-001/philbrickev/ac/evse/ack/remotestop',
        'DEV-001/philbrickev/ac/evse/status',
        'DEV-001/philbrickev/ac/evse/error',
      ],
    });
  });

  it('returns no topic contract without a device ID', () => {
    expect(createDeviceMqttTopics('  ')).toBeNull();
    expect(createDeviceMqttTopics()).toBeNull();
  });

  it('creates stable charger command payloads', () => {
    expect(mqttPayloads.requestId()).toBe('{"request":1}');
    expect(mqttPayloads.remoteStart()).toBe('{"START":1}');
    expect(mqttPayloads.remoteStop()).toBe('{"STOP":1}');
    expect(mqttPayloads.errorAck()).toBe('{"error":"ok"}');
    expect(mqttPayloads.setCurrent(16)).toBe('{"setCurrent":16}');
  });
});
