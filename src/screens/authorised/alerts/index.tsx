import React from 'react';
import { Svgs } from '@assets/svgs';
import { View } from 'react-native';
import { AppText } from '@components';
import { useAlerts } from './useAlerts';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Alerts = () => {
  const { alerts, styles } = useAlerts();

  return (
    <AuthorisedScreen
      roundedHeader
      showBackButton
      contentStyle={styles.content}
    >
      <AppText semibold label="Alert" style={styles.heading} />

      <View style={styles.alertList}>
        {alerts.map(alert => (
          <View key={alert.id} style={styles.alertCard}>
            <Svgs.VoltageGauge
              width={styles.alertIcon.width}
              height={styles.alertIcon.height}
            />
            <AppText
              numberOfLines={1}
              label={alert.title}
              style={styles.alertTitle}
            />
          </View>
        ))}
      </View>
    </AuthorisedScreen>
  );
};

export default Alerts;
