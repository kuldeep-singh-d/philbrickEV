export type MqttCertificateConfig = {
  certificateName: string;
  certificatePassword: string;
};

export type MqttConfig = {
  enabled: boolean;
  host: string;
  port: number;
  clientId: string;
  cleanSession: boolean;
  keepAliveSeconds: number;
  username?: string;
  password?: string;
  certificate: MqttCertificateConfig;
};

export const mqttConfig: MqttConfig = {
  enabled: true,
  host: 'broker.philbrickindia.com',
  port: 8883,
  clientId: 'philbrickEV-mobile',
  cleanSession: true,
  keepAliveSeconds: 60,
  certificate: {
    certificateName: 'client_identity.p12',
    certificatePassword: '123456',
  },
};
