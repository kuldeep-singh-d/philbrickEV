import React from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppButton, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

import useScheduleCharger, { ChargerSchedule } from './useScheduleCharger';

type ScheduleCardProps = {
  item: ChargerSchedule;
  styles: ReturnType<typeof useScheduleCharger>['styles'];
  onPress: (schedule: ChargerSchedule) => void;
  onToggle: (scheduleId: string) => void;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ScheduleCard = ({
  item,
  styles,
  onPress,
  onToggle,
}: ScheduleCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={() => onPress(item)}
    style={({ pressed }) => [
      styles.scheduleCard,
      pressed && styles.scheduleCardPressed,
    ]}
  >
    <View style={styles.scheduleHeader}>
      <View style={styles.scheduleTitleContainer}>
        <AppText
          semibold
          numberOfLines={1}
          label={item.title}
          style={styles.scheduleTitle}
        />
      </View>

      <Switch
        value={item.enabled}
        onValueChange={() => onToggle(item.id)}
        trackColor={{ false: '#D1D5DB', true: '#BEEBC8' }}
        thumbColor={item.enabled ? '#31C44C' : '#FFFFFF'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>

    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Svgs.DashboardTimer
          width={styles.infoIcon.width}
          height={styles.infoIcon.height}
        />
      </View>
      <View style={styles.infoCopy}>
        <AppText
          semibold
          numberOfLines={1}
          label={`${item.startTime} - ${item.endTime}`}
          style={styles.timeText}
        />
        <AppText
          medium
          numberOfLines={1}
          label={`Device ID: ${item.deviceId}`}
          style={styles.deviceIdText}
        />
      </View>
    </View>

    <View style={styles.weekdayRow}>
      {WEEKDAYS.map(day => {
        const isSelected = item.weekdays.includes(day);

        return (
          <View
            key={day}
            style={[styles.weekdayCircle, isSelected && styles.weekdayActive]}
          >
            <AppText
              semibold
              label={day}
              style={[
                styles.weekdayText,
                isSelected && styles.weekdayTextActive,
              ]}
            />
          </View>
        );
      })}
    </View>
  </Pressable>
);

export const ScheduleCharger = () => {
  const { schedules, styles, states, handlers } = useScheduleCharger();

  return (
    <AuthorisedScreen
      // showBackButton
      contentStyle={styles.content}
      fixedContent={
        <View style={styles.headerCopy}>
          <AppText semibold label="Schedule Charger" style={styles.heading} />
        </View>
      }
    >
      {schedules.length === 0 ? (
        <View style={styles.emptyState}>
          <AppText
            semibold
            centered
            label="No schedules yet"
            style={styles.emptyTitle}
          />
          <AppText
            medium
            centered
            numberOfLines={3}
            label="Add a schedule to choose when your charger should run."
            style={styles.emptyDescription}
          />
        </View>
      ) : null}

      {schedules.map(item => (
        <ScheduleCard
          key={item.id}
          item={item}
          styles={styles}
          onPress={handlers.handleEditSchedule}
          onToggle={handlers.handleToggleSchedule}
        />
      ))}

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh schedule list"
          disabled={states.refreshing}
          onPress={handlers.handleRefresh}
          style={({ pressed }) => [
            styles.refreshPill,
            pressed && styles.refreshPillPressed,
            states.refreshing && styles.refreshPillDisabled,
          ]}
        >
          <AppText
            semibold
            label={states.refreshing ? 'Refreshing...' : 'Refresh'}
            style={styles.refreshPillText}
          />
        </Pressable>

        <AppButton
          title="Add"
          onPress={handlers.handleAddSchedule}
          style={styles.addButton}
        />
      </View>
    </AuthorisedScreen>
  );
};

export default ScheduleCharger;
