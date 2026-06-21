import React from 'react';
import { Svgs } from '@assets/svgs';
import { View } from 'react-native';
import { AppText } from '@components';
import { useAlerts } from './useAlerts';
import type { AlertKind } from './useAlerts';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

type AlertIconProps = {
  width?: number;
  height?: number;
};

const ALERT_ICONS: Record<AlertKind, React.ComponentType<AlertIconProps>> = {
  voltage: Svgs.AlertVoltage,
  current: Svgs.AlertCurrent,
  temperature: Svgs.AlertTemperature,
  earth: Svgs.AlertEarthFault,
  scd: Svgs.AlertScdTrip,
  emergency: Svgs.AlertEmergencyStop,
  rcd: Svgs.AlertRcdTest,
  generic: Svgs.AlertGeneric,
};

export const Alerts = () => {
  const { alerts, styles } = useAlerts();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      {alerts.length > 0 ? (
        <>
          <View style={styles.headingRow}>
            {/* <AppText semibold label="Active alerts" style={styles.heading} /> */}
          </View>

          <View style={styles.alertList}>
            {alerts.map(alert => {
              const AlertIcon = ALERT_ICONS[alert.kind];

              return (
                <View
                  accessible
                  key={alert.id}
                  style={styles.alertCard}
                  accessibilityLabel={`${alert.title}. ${alert.category}. Active alert.`}
                >
                  <View style={styles.alertAccent} />
                  <View style={styles.iconContainer}>
                    <AlertIcon
                      width={styles.alertIcon.width}
                      height={styles.alertIcon.height}
                    />
                  </View>

                  <View style={styles.alertContent}>
                    <AppText
                      semibold
                      numberOfLines={2}
                      label={alert.title}
                      style={styles.alertTitle}
                    />
                    <AppText
                      medium
                      label={alert.category}
                      style={styles.categoryText}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Svgs.CheckWhite
              width={styles.emptyIcon.width}
              height={styles.emptyIcon.height}
            />
          </View>
          <AppText
            semibold
            centered
            label="All systems normal"
            style={styles.emptyTitle}
          />
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
