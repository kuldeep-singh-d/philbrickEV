import { useCallback, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';

import { show } from '@utils/helpers';
import { routes } from '@routes';
import { useSelector } from '@hooks';
import { selectDevices } from '@store/slices/devices/devices';
import type { DropdownItem } from '@components/form/appDropdown/types';
import type { ChargerSchedule } from '../scheduleCharger/useScheduleCharger';

import useStyles from './styles';

const DAY_OPTIONS: DropdownItem[] = [
  { label: 'Sunday', value: 'Sun' },
  { label: 'Monday', value: 'Mon' },
  { label: 'Tuesday', value: 'Tue' },
  { label: 'Wednesday', value: 'Wed' },
  { label: 'Thursday', value: 'Thu' },
  { label: 'Friday', value: 'Fri' },
  { label: 'Saturday', value: 'Sat' },
];

const DAY_ORDER = DAY_OPTIONS.map(day => day.value);

const MOCK_DEVICE_OPTIONS: DropdownItem[] = [
  { label: 'Home Charger (PB-EV-001)', value: 'PB-EV-001' },
  { label: 'Garage Charger (PB-EV-002)', value: 'PB-EV-002' },
  { label: 'Office Charger (PB-EV-003)', value: 'PB-EV-003' },
];

type ScheduleRouteParams = {
  schedule?: ChargerSchedule;
};

const formatScheduleTime = (date: Date) => moment(date).format('hh:mm A');

const getTimeMinutes = (date: Date) => {
  return date.getHours() * 60 + date.getMinutes();
};

const isEndTimeAfterStartTime = (start: Date, end: Date) => {
  return getTimeMinutes(end) > getTimeMinutes(start);
};

const parseScheduleTime = (time?: string) => {
  if (!time) {
    return undefined;
  }

  const parsed = moment(time, 'hh:mm A');
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const getDeviceLabel = (name: string, deviceId: string) => {
  return name ? `${name} (${deviceId})` : deviceId;
};

const getDeviceNameFromLabel = (label: string, deviceId: string) => {
  return label.replace(` (${deviceId})`, '').trim() || deviceId;
};

const sortDaysByWeekOrder = (days: DropdownItem[]) => {
  return [...days].sort((firstDay, secondDay) => {
    return (
      DAY_ORDER.indexOf(firstDay.value) - DAY_ORDER.indexOf(secondDay.value)
    );
  });
};

export const useSchedule = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();
  const route = useRoute();
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const devicesResponse = useSelector(state => state.devices.data);
  const params = route.params as ScheduleRouteParams | undefined;
  const editingSchedule = params?.schedule;
  const selectedDeviceId =
    selectedDevice?.device_id || selectedDevice?.deviceId || '';

  const dayOptions = useMemo(() => DAY_OPTIONS, []);
  const deviceOptions = useMemo(() => {
    const apiDeviceOptions = selectDevices(devicesResponse)
      .map(device => {
        const deviceId = device.device_id || device.deviceId || '';

        if (!deviceId) {
          return null;
        }

        return {
          label: getDeviceLabel(device.name || '', deviceId),
          value: deviceId,
        };
      })
      .filter(Boolean) as DropdownItem[];

    const selectedDeviceOption = selectedDeviceId
      ? [
          {
            label: getDeviceLabel(selectedDevice?.name || '', selectedDeviceId),
            value: selectedDeviceId,
          },
        ]
      : [];

    const mergedOptions = [
      ...selectedDeviceOption,
      ...apiDeviceOptions,
      ...MOCK_DEVICE_OPTIONS,
    ];

    return mergedOptions.filter((option, index, options) => {
      return options.findIndex(item => item.value === option.value) === index;
    });
  }, [devicesResponse, selectedDevice?.name, selectedDeviceId]);

  const [title, setTitle] = useState(editingSchedule?.title || '');
  const [selectedDeviceOption, setSelectedDeviceOption] =
    useState<DropdownItem | null>(() => {
      if (editingSchedule?.deviceId) {
        return {
          label: getDeviceLabel(
            editingSchedule.deviceName,
            editingSchedule.deviceId,
          ),
          value: editingSchedule.deviceId,
        };
      }

      if (selectedDeviceId) {
        return {
          label: getDeviceLabel(selectedDevice?.name || '', selectedDeviceId),
          value: selectedDeviceId,
        };
      }

      return null;
    });
  const [selectedDays, setSelectedDays] = useState<DropdownItem[]>(() => {
    const weekdays = editingSchedule?.weekdays || [];

    return DAY_OPTIONS.filter(day => weekdays.includes(day.value));
  });
  const [startTime, setStartTime] = useState<Date | undefined>(() =>
    parseScheduleTime(editingSchedule?.startTime),
  );
  const [endTime, setEndTime] = useState<Date | undefined>(() =>
    parseScheduleTime(editingSchedule?.endTime),
  );
  const [titleError, setTitleError] = useState('');
  const [deviceError, setDeviceError] = useState('');
  const [daysError, setDaysError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');

  const handleSelectedDaysChange = useCallback((days: DropdownItem[]) => {
    setSelectedDays(sortDaysByWeekOrder(days));
  }, []);

  const handleSaveSchedule = useCallback(() => {
    const normalizedTitle = title.trim();
    let valid = true;

    if (!normalizedTitle) {
      setTitleError('Scheduler name is required');
      valid = false;
    }

    if (!selectedDeviceOption) {
      setDeviceError('Select device');
      valid = false;
    }

    if (selectedDays.length === 0) {
      setDaysError('Select at least one day');
      valid = false;
    }

    if (!startTime) {
      setStartTimeError('Start time is required');
      valid = false;
    }

    if (!endTime) {
      setEndTimeError('End time is required');
      valid = false;
    }

    if (startTime && endTime && !isEndTimeAfterStartTime(startTime, endTime)) {
      setEndTimeError('End time must be after start time');
      valid = false;
    }

    if (!valid || !selectedDeviceOption || !startTime || !endTime) {
      return;
    }

    const savedSchedule: ChargerSchedule = {
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      title: normalizedTitle,
      deviceId: selectedDeviceOption.value,
      deviceName: getDeviceNameFromLabel(
        selectedDeviceOption.label,
        selectedDeviceOption.value,
      ),
      weekdays: sortDaysByWeekOrder(selectedDays).map(day => day.value),
      startTime: formatScheduleTime(startTime),
      endTime: formatScheduleTime(endTime),
      enabled: editingSchedule?.enabled ?? true,
    };

    show.success(
      editingSchedule
        ? 'Schedule updated successfully.'
        : 'Schedule added successfully.',
    );
    navigation.navigate(routes.app.scheduleCharger, { savedSchedule });
  }, [
    editingSchedule,
    endTime,
    navigation,
    selectedDays,
    selectedDeviceOption,
    startTime,
    title,
  ]);

  return {
    styles,
    states: {
      isEditing: Boolean(editingSchedule),
      title,
      selectedDeviceOption,
      selectedDays,
      startTime,
      endTime,
      titleError,
      deviceError,
      daysError,
      startTimeError,
      endTimeError,
    },
    handlers: {
      setTitle,
      setSelectedDeviceOption,
      setSelectedDays: handleSelectedDaysChange,
      setStartTime,
      setEndTime,
      setTitleError,
      setDeviceError,
      setDaysError,
      setStartTimeError,
      setEndTimeError,
      handleSaveSchedule,
    },
    constants: {
      dayOptions,
      deviceOptions,
    },
  };
};

export default useSchedule;
