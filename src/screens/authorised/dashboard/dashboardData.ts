export const FAULT_STATUS_BITS = Object.freeze([
  'overVoltageRedPhase',
  'underVoltageRedPhase',
  'overCurrentRedPhase',
  'overTemperature',
  'scdTripTriggered',
  'earthFaultTriggered',
  'earthPresence',
  'overVoltageBluePhase',
  'overVoltageYellowPhase',
  'overCurrentBluePhase',
  'overCurrentYellowPhase',
  'underVoltageBluePhase',
  'underVoltageYellowPhase',
  'finalDebouncedValue',
  'rcdTestFailed',
] as const);

type FaultName = (typeof FAULT_STATUS_BITS)[number];
type UnknownRecord = Record<string, unknown>;

export interface DashboardTelemetry {
  cpStatus?: number;
  cpStatusText: string;
  power: number;
  temperature?: number;
  setCurrent?: number;
  voltage: number;
  duration: string;
  evseCapacityText: string;
  phases: {
    R: { voltage: number; current: number };
    Y: { voltage: number; current: number };
    B: { voltage: number; current: number };
  };
  faultStatus: number;
  activeFaults: FaultName[];
}

const getNumber = (
  source: UnknownRecord,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const getString = (
  source: UnknownRecord,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

export const getCpStatusString = (cp?: number) => {
  switch (cp) {
    case 0:
      return 'NOT CONNECTED';
    case 1:
      return 'CONNECTED (Waiting Authentication)';
    case 2:
      return 'CONNECTED';
    case 3:
      return 'CHARGING IN PROGRESS';
    case 4:
      return 'VENTILATION REQUIRED';
    case 5:
      return 'CHARGING FINISHED';
    case 6:
      return 'CP ERROR';
    default:
      return 'UNKNOWN';
  }
};

export const getEvseCapacityText = (capacity?: number) => {
  switch (capacity) {
    case 1:
      return '3.3 kW';
    case 2:
      return '7.2 kW';
    case 3:
      return '11 kW';
    case 4:
      return '22 kW';
    default:
      return '--';
  }
};

export const getActiveFaults = (faultStatus = 0): FaultName[] =>
  FAULT_STATUS_BITS.filter((_, bit) => (faultStatus & (1 << bit)) !== 0);

export const formatDuration = (value?: string | number) => {
  if (typeof value === 'string' && /^\d{1,3}:\d{2}:\d{2}$/.test(value)) {
    return value.padStart(8, '0');
  }

  const totalSeconds =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
};

export const parseDashboardMessage = (
  message?: string | null,
  device?: UnknownRecord | null,
): DashboardTelemetry => {
  let source: UnknownRecord = {};

  if (message) {
    try {
      const parsed = JSON.parse(message);

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        source = parsed as UnknownRecord;
      }
    } catch {
      source = {};
    }
  }

  const redVoltage =
    getNumber(source, ['votlageR', 'voltageR', 'voltage_r']) ?? 0;
  const yellowVoltage =
    getNumber(source, ['votlageY', 'voltageY', 'voltage_y']) ?? 0;
  const blueVoltage =
    getNumber(source, ['votlageB', 'voltageB', 'voltage_b']) ?? 0;
  const redCurrent = getNumber(source, ['currentR', 'current_r']) ?? 0;
  const yellowCurrent = getNumber(source, ['currentY', 'current_y']) ?? 0;
  const blueCurrent = getNumber(source, ['currentB', 'current_b']) ?? 0;
  const cpStatus = getNumber(source, ['cp_stat', 'cpStatus', 'cp_status']);
  const capacity =
    getNumber(source, ['evse_capacity', 'evseCapacity', 'capacity']) ??
    getNumber(device || {}, ['evse_capacity', 'evseCapacity', 'capacity']);
  const faultStatus =
    getNumber(source, [
      'fault_status',
      'faultStatus',
      'fault',
      'fault_bits',
    ]) ?? 0;
  const duration =
    getString(source, ['duration', 'timer', 'charging_time']) ??
    getNumber(source, ['duration_seconds', 'chargingTimeSeconds']);

  return {
    cpStatus,
    cpStatusText: getCpStatusString(cpStatus),
    power: getNumber(source, ['power', 'power_kw', 'powerKw']) ?? 0,
    temperature: getNumber(source, ['temperature', 'temp']),
    setCurrent: getNumber(source, [
      'setcurrentfb',
      'setCurrentFeedback',
      'set_current',
    ]),
    voltage:
      getNumber(source, ['voltage', 'averageVoltage']) ?? redVoltage ?? 0,
    duration: formatDuration(duration),
    evseCapacityText: getEvseCapacityText(capacity),
    phases: {
      R: { voltage: redVoltage, current: redCurrent },
      Y: { voltage: yellowVoltage, current: yellowCurrent },
      B: { voltage: blueVoltage, current: blueCurrent },
    },
    faultStatus,
    activeFaults: getActiveFaults(faultStatus),
  };
};

export const formatMetric = (
  value: number | undefined,
  maximumFractionDigits = 1,
) => {
  if (value === undefined || !Number.isFinite(value)) {
    return '--';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value);
};
