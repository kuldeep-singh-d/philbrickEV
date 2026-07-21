import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import { routes } from '@routes';
import { useSelector } from '@hooks';

import useStyles from './styles';

export type ChargerSchedule = {
  id: string;
  title: string;
  deviceId: string;
  deviceName: string;
  weekdays: string[];
  startTime: string;
  endTime: string;
  enabled: boolean;
};

const MOCK_SCHEDULES: ChargerSchedule[] = [
  {
    id: 'schedule-night',
    title: 'Night charging',
    deviceId: 'PB-EV-001',
    deviceName: 'Home Charger',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '06:30 PM',
    endTime: '11:20 PM',
    enabled: true,
  },
  {
    id: 'schedule-weekend',
    title: 'Weekend top-up',
    deviceId: 'PB-EV-002',
    deviceName: 'Garage Charger',
    weekdays: ['Sat', 'Sun'],
    startTime: '08:00 AM',
    endTime: '10:30 AM',
    enabled: false,
  },
];

type ScheduleRouteParams = {
  savedSchedule?: ChargerSchedule;
};

export const useScheduleCharger = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();
  const route = useRoute();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [schedules, setSchedules] = useState<ChargerSchedule[]>(MOCK_SCHEDULES);
  const [refreshing, setRefreshing] = useState(false);

  const selectedDeviceName = useMemo(() => {
    return selectedDevice?.name || selectedDevice?.device_id || '';
  }, [selectedDevice?.device_id, selectedDevice?.name]);

  useEffect(() => {
    const params = route.params as ScheduleRouteParams | undefined;
    const savedSchedule = params?.savedSchedule;

    if (!savedSchedule) {
      return;
    }

    setSchedules(current => {
      const scheduleExists = current.some(item => item.id === savedSchedule.id);

      if (scheduleExists) {
        return current.map(item =>
          item.id === savedSchedule.id ? savedSchedule : item,
        );
      }

      return [savedSchedule, ...current];
    });
    navigation.setParams({ savedSchedule: undefined });
  }, [navigation, route.params]);

  const handleAddSchedule = useCallback(() => {
    navigation.push(routes.app.schedule, { schedule: undefined });
  }, [navigation]);

  const handleEditSchedule = useCallback(
    (schedule: ChargerSchedule) => {
      navigation.push(routes.app.schedule, { schedule });
    },
    [navigation],
  );

  const handleToggleSchedule = useCallback((scheduleId: string) => {
    setSchedules(current =>
      current.map(item =>
        item.id === scheduleId ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  }, []);

  const handleRefresh = useCallback(() => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, [refreshing]);

  useEffect(
    () => () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    },
    [],
  );

  return {
    schedules,
    styles,
    states: {
      selectedDeviceName,
      refreshing,
    },
    handlers: {
      handleAddSchedule,
      handleEditSchedule,
      handleRefresh,
      handleToggleSchedule,
    },
  };
};

export default useScheduleCharger;
