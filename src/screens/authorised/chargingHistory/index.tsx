import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

import useChargingHistory, { ChargingHistoryItem } from './useChargingHistory';

type SessionCardProps = {
  item: ChargingHistoryItem;
  styles: ReturnType<typeof useChargingHistory>['styles'];
};

const SessionCard = ({ item, styles }: SessionCardProps) => (
  <View style={styles.sessionCard}>
    <View style={styles.sessionHeader}>
      <View style={styles.sessionTitleContainer}>
        <AppText
          semibold
          numberOfLines={1}
          label={item.deviceName}
          style={styles.sessionTitle}
        />
        <AppText
          medium
          numberOfLines={1}
          label={`Device ID: ${item.deviceIdentifier}`}
          style={styles.sessionSubtitle}
        />
      </View>

      <View
        style={[
          styles.statusPill,
          item.statusType === 'inProgress' && styles.statusPillActive,
        ]}
      >
        <AppText
          semibold
          label={item.status}
          style={[
            styles.statusText,
            item.statusType === 'inProgress' && styles.statusTextActive,
          ]}
        />
      </View>
    </View>

    <View style={styles.sessionDivider} />

    <View style={styles.metricGrid}>
      <View style={styles.metricItem}>
        <AppText medium label="Started" style={styles.metricLabel} />
        <AppText
          semibold
          numberOfLines={2}
          label={item.startedAt}
          style={styles.metricValue}
        />
      </View>
      <View style={styles.metricItem}>
        <AppText medium label="Ended" style={styles.metricLabel} />
        <AppText
          semibold
          numberOfLines={2}
          label={item.endedAt}
          style={styles.metricValue}
        />
      </View>
      <View style={styles.metricItem}>
        <AppText medium label="Duration" style={styles.metricLabel} />
        <AppText
          semibold
          numberOfLines={1}
          label={item.duration}
          style={styles.metricValue}
        />
      </View>
    </View>
  </View>
);

export const ChargingHistory = () => {
  const { history, styles, states, handlers } = useChargingHistory();
  const showInitialLoader =
    states.loading && history.length === 0 && !states.refreshing;
  const showEmptyState =
    !showInitialLoader && history.length === 0 && !states.error;

  return (
    <AuthorisedScreen
      contentStyle={styles.content}
      fixedContent={
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <AppText semibold label="Charging History" style={styles.heading} />
            {states.selectedDeviceName ? (
              <AppText
                medium
                numberOfLines={1}
                label={states.selectedDeviceName}
                style={styles.subheading}
              />
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change selected charger"
            onPress={handlers.handleSelectDevice}
            style={({ pressed }) => [
              styles.changeDeviceButton,
              pressed && styles.pressedChangeDeviceButton,
            ]}
          >
            <AppText semibold label="Change" style={styles.changeDeviceText} />
          </Pressable>
        </View>
      }
      refreshControl={
        <RefreshControl
          tintColor="#31C44C"
          refreshing={states.refreshing}
          colors={['#31C44C', '#0BB2C3']}
          onRefresh={handlers.handleRefresh}
        />
      }
    >
      {showInitialLoader ? (
        <ActivityIndicator size="large" color="#0BB2C3" style={styles.loader} />
      ) : null}

      {states.error && history.length === 0 ? (
        <View style={styles.emptyState}>
          <AppText
            semibold
            centered
            label="Unable to load history"
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label={states.error}
            style={styles.emptyDescription}
          />
          <AppButton
            title="Retry"
            onPress={handlers.handleRefresh}
            style={styles.emptyActionButton}
          />
        </View>
      ) : null}

      {showEmptyState ? (
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
            label={
              states.hasSelectedDevice
                ? 'No charging history yet'
                : 'Select a charger'
            }
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label={
              states.hasSelectedDevice
                ? 'Completed charging sessions will appear here.'
                : 'Choose a charger to view its completed sessions.'
            }
            style={styles.emptyDescription}
          />
          {!states.hasSelectedDevice ? (
            <AppButton
              title="Select Device"
              onPress={handlers.handleSelectDevice}
              style={styles.emptyActionButton}
            />
          ) : null}
        </View>
      ) : null}

      {history.map(item => (
        <SessionCard key={item.id} item={item} styles={styles} />
      ))}

      {states.error && history.length > 0 ? (
        <AppText
          centered
          numberOfLines={2}
          label={states.error}
          style={styles.inlineError}
        />
      ) : null}

      {states.hasMore && history.length > 0 ? (
        <AppButton
          title="Load More"
          loader={states.loadingMore}
          disabled={states.loading}
          onPress={handlers.handleLoadMore}
          style={styles.loadMoreButton}
        />
      ) : null}
    </AuthorisedScreen>
  );
};

export default ChargingHistory;
