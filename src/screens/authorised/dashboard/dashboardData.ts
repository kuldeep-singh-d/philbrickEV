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
export const PHASE_NAMES = ['R', 'Y', 'B'] as const;
export type PhaseName = (typeof PHASE_NAMES)[number];
type UnknownRecord = Record<string, unknown>;

export const FAULT_LABELS: Record<FaultName, string> = {
  overVoltageRedPhase: 'Over voltage on R phase',
  underVoltageRedPhase: 'Under voltage on R phase',
  overCurrentRedPhase: 'Over current on R phase',
  overTemperature: 'Over temperature',
  scdTripTriggered: 'SCD trip triggered',
  earthFaultTriggered: 'Earth fault triggered',
  earthPresence: 'Earth presence fault',
  overVoltageBluePhase: 'Over voltage on B phase',
  overVoltageYellowPhase: 'Over voltage on Y phase',
  overCurrentBluePhase: 'Over current on B phase',
  overCurrentYellowPhase: 'Over current on Y phase',
  underVoltageBluePhase: 'Under voltage on B phase',
  underVoltageYellowPhase: 'Under voltage on Y phase',
  finalDebouncedValue: 'Emergency stop',
  rcdTestFailed: 'RCD test failed',
};

export interface DashboardTelemetry {
  cpStatus?: number;
  cpStatusText: string;
  auth?: number;
  power: number;
  temperature?: number;
  setCurrent?: number;
  voltage: number;
  duration: string;
  evseCapacityText: string;
  phases: Record<PhaseName, { voltage: number; current: number }>;
  faultStatus: number;
  activeFaults: FaultName[];
}

export interface DashboardPhaseParameters {
  phases: DashboardTelemetry['phases'];
  visiblePhaseNames: PhaseName[];
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

const parseMessageSource = (message?: string | null): UnknownRecord => {
  if (!message) {
    return {};
  }

  try {
    const parsed = JSON.parse(message);

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as UnknownRecord)
      : {};
  } catch {
    return {};
  }
};

const getPhaseValues = (
  source: UnknownRecord,
  fallback?: DashboardTelemetry['phases'],
) => ({
  R: {
    voltage:
      getNumber(source, ['votlageR', 'voltageR', 'voltage_r']) ??
      fallback?.R.voltage ??
      0,
    current:
      getNumber(source, ['currentR', 'current_r']) ?? fallback?.R.current ?? 0,
  },
  Y: {
    voltage:
      getNumber(source, ['votlageY', 'voltageY', 'voltage_y']) ??
      fallback?.Y.voltage ??
      0,
    current:
      getNumber(source, ['currentY', 'current_y']) ?? fallback?.Y.current ?? 0,
  },
  B: {
    voltage:
      getNumber(source, ['votlageB', 'voltageB', 'voltage_b']) ??
      fallback?.B.voltage ??
      0,
    current:
      getNumber(source, ['currentB', 'current_b']) ?? fallback?.B.current ?? 0,
  },
});

const PHASE_KEYS: Record<PhaseName, string[]> = {
  R: ['votlageR', 'voltageR', 'voltage_r', 'currentR', 'current_r'],
  Y: ['votlageY', 'voltageY', 'voltage_y', 'currentY', 'current_y'],
  B: ['votlageB', 'voltageB', 'voltage_b', 'currentB', 'current_b'],
};

export const parsePhaseParametersMessage = (
  message?: string | null,
  fallbackPhases?: DashboardTelemetry['phases'],
): DashboardPhaseParameters => {
  const source = parseMessageSource(message);
  const phases = getPhaseValues(source, fallbackPhases);
  const phasesIncludedInResponse = PHASE_NAMES.filter(phase =>
    PHASE_KEYS[phase].some(key =>
      Object.prototype.hasOwnProperty.call(source, key),
    ),
  );
  const responseCapacity = getNumber(source, ['evsecap']);
  const visiblePhaseNames =
    phasesIncludedInResponse.length > 0
      ? phasesIncludedInResponse
      : responseCapacity === 0 || responseCapacity === 1
      ? (['R'] as PhaseName[])
      : [...PHASE_NAMES];

  return { phases, visiblePhaseNames };
};

export const getCpStatusString = (cp?: number) => {
  switch (cp) {
    case 0:
      return 'NOT CONNECTED';
    case 1:
      return 'WAITING FOR AUTHENTICATION';
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

export const isCpStatusChargingActive = (cp?: number) =>
  cp === 3 || cp === 4;

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
  const source = parseMessageSource(message);
  const phases = getPhaseValues(source);
  const cpStatus = getNumber(source, ['cp_stat', 'cpStatus', 'cp_status']);
  const capacity =
    getNumber(source, ['evse_capacity', 'evseCapacity', 'capacity']) ??
    getNumber(device || {}, ['evse_capacity', 'evseCapacity', 'capacity']);
  const faultStatus =
    getNumber(source, ['fault_status', 'faultStatus', 'fault', 'fault_bits']) ??
    0;
  const duration =
    getString(source, ['duration', 'timer', 'charging_time']) ??
    getNumber(source, ['duration_seconds', 'chargingTimeSeconds']);

  return {
    cpStatus,
    cpStatusText: getCpStatusString(cpStatus),
    auth: getNumber(source, ['auth']),
    power: getNumber(source, ['power', 'power_kw', 'powerKw']) ?? 0,
    temperature: getNumber(source, ['temperature', 'temp']),
    setCurrent: getNumber(source, [
      'setcurrentfb',
      'setCurrentFeedback',
      'set_current',
    ]),
    voltage:
      getNumber(source, ['voltage', 'averageVoltage']) ?? phases.R.voltage,
    duration: formatDuration(duration),
    evseCapacityText: getEvseCapacityText(capacity),
    phases,
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

export const getVisiblePhaseNames = (
  telemetry: DashboardTelemetry,
): PhaseName[] => {
  const visiblePhases = PHASE_NAMES.filter(phase => {
    const phaseTelemetry = telemetry.phases[phase];

    return phaseTelemetry.voltage !== 0 || phaseTelemetry.current !== 0;
  });

  return visiblePhases.length > 0 ? visiblePhases : [...PHASE_NAMES];
};
