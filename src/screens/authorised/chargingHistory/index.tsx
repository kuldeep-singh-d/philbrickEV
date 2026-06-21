import React from 'react';
import { View } from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

import useChargingHistory from './useChargingHistory';

export const ChargingHistory = () => {
  const { history, styles } = useChargingHistory();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Charging History" style={styles.heading} />

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Svgs.TabChargingHistory
              color="#0A9FAC"
              width={styles.emptyIcon.width}
              height={styles.emptyIcon.height}
            />
          </View>
          <AppText
            semibold
            centered
            label="No charging history yet"
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label="Completed charging sessions will appear here."
            style={styles.emptyDescription}
          />
        </View>
      ) : null}
    </AuthorisedScreen>
  );
};

export default ChargingHistory;
