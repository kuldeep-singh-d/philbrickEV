import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { routes } from '@routes';
import { useDispatch, useSelector } from '@hooks';
import { getApiErrorMessage } from '@utils/apiError';
import type { ChargingSession } from '@store/slices/devices/chargingSessions';
import {
  clearChargingSessions,
  fetchChargingSessions,
} from '@store/slices/devices/chargingSessions';

import useStyles from './styles';

const PER_PAGE = 25;

type HistoryStatus = 'completed' | 'inProgress';

export type ChargingHistoryItem = {
  id: string;
  deviceName: string;
  deviceIdentifier: string;
  startedAt: string;
  endedAt: string;
  duration: string;
  energy: string;
  status: string;
  statusType: HistoryStatus;
};

const getString = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

const getNumber = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    const numericValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
        ? Number(value)
        : undefined;

    if (numericValue !== undefined && Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return undefined;
};

const getSelectedDeviceId = (device?: Record<string, unknown> | null) => {
  const value = device?.id ?? device?.device_id ?? device?.deviceId;

  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}, ${date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const formatDurationSeconds = (seconds?: number) => {
  if (seconds === undefined || seconds <= 0) {
    return '-';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${Math.max(1, minutes)}m`;
};

const getDuration = (
  session: ChargingSession,
  startedAt: string,
  endedAt: string,
) => {
  const source = session as Record<string, unknown>;
  const rawDuration = getString(source, ['duration', 'charging_duration']);

  if (rawDuration) {
    return rawDuration;
  }

  const durationSeconds = getNumber(source, [
    'duration_seconds',
    'charging_duration_seconds',
  ]);
  const durationMinutes = getNumber(source, ['duration_minutes']);
  const seconds =
    durationSeconds ??
    (durationMinutes !== undefined ? durationMinutes * 60 : undefined);

  if (seconds !== undefined && Number.isFinite(seconds)) {
    return formatDurationSeconds(seconds);
  }

  const startedAtMs = startedAt ? new Date(startedAt).getTime() : NaN;
  const endedAtMs = endedAt ? new Date(endedAt).getTime() : NaN;

  if (!Number.isNaN(startedAtMs) && !Number.isNaN(endedAtMs)) {
    return formatDurationSeconds(
      Math.max(0, Math.floor((endedAtMs - startedAtMs) / 1000)),
    );
  }

  return '-';
};

const formatEnergy = (session: ChargingSession) => {
  const value = getNumber(session as Record<string, unknown>, [
    'energy_kwh',
    'kwh',
    'energy',
    'consumed_energy',
  ]);

  return value === undefined
    ? '-'
    : `${value.toFixed(value % 1 === 0 ? 0 : 2)} kWh`;
};

const normalizeSession = (
  session: ChargingSession,
  index: number,
): ChargingHistoryItem => {
  const source = session as Record<string, unknown>;
  const device = (session.device || {}) as Record<string, unknown>;
  const startedAt = getString(source, [
    'started_at',
    'startedAt',
    'start_time',
  ]);
  const endedAt = getString(source, ['ended_at', 'endedAt', 'end_time']);
  const isInProgress =
    !endedAt || (Boolean(startedAt) && startedAt === endedAt);
  const deviceIdentifier =
    getString(device, ['device_id', 'deviceId', 'id']) ||
    getString(source, ['device_id', 'deviceId']) ||
    '-';

  return {
    id:
      getString(source, ['id', 'uuid']) ||
      `${deviceIdentifier}-${startedAt || index}`,
    deviceName:
      getString(device, ['name']) ||
      getString(source, ['device_name', 'name']) ||
      'Charging session',
    deviceIdentifier,
    startedAt: formatDateTime(startedAt),
    endedAt: isInProgress ? '-' : formatDateTime(endedAt),
    duration: isInProgress
      ? 'In progress'
      : getDuration(session, startedAt, endedAt),
    energy: formatEnergy(session),
    status: isInProgress ? 'In progress' : 'Completed',
    statusType: isInProgress ? 'inProgress' : 'completed',
  };
};

export const useChargingHistory = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const chargingSessions = useSelector(state => state.chargingSessions);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const selectedDeviceId = useMemo(
    () => getSelectedDeviceId(selectedDevice as Record<string, unknown> | null),
    [selectedDevice],
  );

  useFocusEffect(
    useCallback(() => {
      if (!selectedDeviceId) {
        dispatch(clearChargingSessions());
        return;
      }

      dispatch(clearChargingSessions());
      dispatch(
        fetchChargingSessions({
          deviceId: selectedDeviceId,
          page: 1,
          perPage: PER_PAGE,
        }),
      );
    }, [dispatch, selectedDeviceId]),
  );

  useEffect(() => {
    if (!chargingSessions.loading) {
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [chargingSessions.loading]);

  const history = useMemo(
    () => chargingSessions.items.map(normalizeSession),
    [chargingSessions.items],
  );

  const selectedDeviceName = useMemo(() => {
    const device = (selectedDevice || {}) as Record<string, unknown>;

    return (
      getString(device, ['name']) ||
      getString(device, ['device_id', 'deviceId', 'id']) ||
      ''
    );
  }, [selectedDevice]);

  const handleRefresh = useCallback(() => {
    if (!selectedDeviceId || chargingSessions.loading) {
      return;
    }

    setRefreshing(true);
    dispatch(
      fetchChargingSessions({
        deviceId: selectedDeviceId,
        page: 1,
        perPage: PER_PAGE,
      }),
    );
  }, [chargingSessions.loading, dispatch, selectedDeviceId]);

  const handleLoadMore = useCallback(() => {
    if (
      !selectedDeviceId ||
      chargingSessions.loading ||
      !chargingSessions.hasMore
    ) {
      return;
    }

    setLoadingMore(true);
    dispatch(
      fetchChargingSessions({
        deviceId: selectedDeviceId,
        page: chargingSessions.page + 1,
        perPage: PER_PAGE,
      }),
    );
  }, [
    chargingSessions.hasMore,
    chargingSessions.loading,
    chargingSessions.page,
    dispatch,
    selectedDeviceId,
  ]);

  const handleSelectDevice = useCallback(() => {
    navigation.navigate(routes.app.selectDevice);
  }, [navigation]);

  return {
    history,
    styles,
    states: {
      selectedDeviceName,
      hasSelectedDevice: Boolean(selectedDeviceId),
      loading: Boolean(chargingSessions.loading),
      refreshing,
      loadingMore,
      hasMore: Boolean(chargingSessions.hasMore),
      error: chargingSessions.error
        ? getApiErrorMessage(
            chargingSessions.error,
            'Unable to load charging history.',
          )
        : '',
    },
    handlers: {
      handleRefresh,
      handleLoadMore,
      handleSelectDevice,
    },
  };
};

export default useChargingHistory;
