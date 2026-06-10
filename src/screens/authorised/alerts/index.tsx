import React from 'react';
import { AppText } from '@components';
import { useAlerts } from './useAlerts';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

export const Alerts = () => {
  const { styles } = useAlerts();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Alerts" style={styles.heading} />
      <AppText
        numberOfLines={3}
        style={styles.message}
        label="Here you can view device alerts and notifications."
      />
    </AuthorisedScreen>
  );
};

export default Alerts;
