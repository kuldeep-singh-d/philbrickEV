import React from 'react';
import { Svgs } from '@assets/svgs';
import { View } from 'react-native';
import { AppText } from '@components';
import { useAlerts } from './useAlerts';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Alerts = () => {
  const { alerts, styles } = useAlerts();

  console.log('\n ~ Alerts ~ alerts:', alerts);
  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Alert" style={styles.heading} />

      {alerts.length > 0 ? (
        <View style={styles.alertList}>
          {alerts.map(alert => (
            <View key={alert.id} style={styles.alertCard}>
              <Svgs.VoltageGauge
                width={styles.alertIcon.width}
                height={styles.alertIcon.height}
              />
              <AppText
                numberOfLines={2}
                label={alert.title}
                style={styles.alertTitle}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <AppText
            medium
            centered
            label="No active charger alerts."
            style={styles.emptyText}
          />
        </View>
      )}
    </AuthorisedScreen>
  );
};

export default Alerts;
