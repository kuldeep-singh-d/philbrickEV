import {
  getActiveFaults,
  getCpStatusString,
  getEvseCapacityText,
  getVisiblePhaseNames,
  parseDashboardMessage,
} from '../src/screens/authorised/dashboard/dashboardData';

describe('dashboard MQTT data mapping', () => {
  it('maps the current device payload including its voltage field typo', () => {
    const telemetry = parseDashboardMessage(
      JSON.stringify({
        cp_stat: 3,
        votlageR: 230.4,
        votlageY: 231,
        votlageB: 229.8,
        currentR: 2,
        currentY: 15,
        currentB: 20,
        power: 1,
        temperature: 26.8,
        setcurrentfb: 15,
        fault_status: 9,
      }),
    );

    expect(telemetry.cpStatusText).toBe('CHARGING IN PROGRESS');
    expect(telemetry.voltage).toBe(230.4);
    expect(telemetry.phases.Y.current).toBe(15);
    expect(telemetry.setCurrent).toBe(15);
    expect(telemetry.activeFaults).toEqual([
      'overVoltageRedPhase',
      'overTemperature',
    ]);
  });

  it('maps the live EV device payload used by the status publisher', () => {
    const telemetry = parseDashboardMessage(
      JSON.stringify({
        cp_stat: 0,
        votlageR: 230.4,
        votlageY: 0,
        votlageB: 0,
        currentR: 0,
        currentY: 0,
        currentB: 0,
        power: 0,
        temperature: 27,
        setcurrentfb: 12,
        auth: 1,
      }),
    );

    expect(telemetry.cpStatusText).toBe('NOT CONNECTED');
    expect(telemetry.temperature).toBe(27);
    expect(telemetry.setCurrent).toBe(12);
    expect(telemetry.voltage).toBe(230.4);
    expect(telemetry.phases.R).toEqual({ voltage: 230.4, current: 0 });
  });

  it('shows only phases with voltage or current data once telemetry arrives', () => {
    const singlePhaseTelemetry = parseDashboardMessage(
      JSON.stringify({
        cp_stat: 0,
        votlageR: 220.4,
        votlageY: 0,
        votlageB: 0,
        currentR: 0,
        currentY: 0,
        currentB: 0,
      }),
    );
    const threePhaseTelemetry = parseDashboardMessage(
      JSON.stringify({
        voltageR: 230,
        voltageY: 231,
        voltageB: 229,
        currentR: 1,
        currentY: 2,
        currentB: 3,
      }),
    );

    expect(getVisiblePhaseNames(singlePhaseTelemetry)).toEqual(['R']);
    expect(getVisiblePhaseNames(threePhaseTelemetry)).toEqual(['R', 'Y', 'B']);
    expect(getVisiblePhaseNames(parseDashboardMessage(null))).toEqual([
      'R',
      'Y',
      'B',
    ]);
  });

  it('accepts future camelCase aliases and device capacity fallback', () => {
    const telemetry = parseDashboardMessage(
      JSON.stringify({
        cpStatus: 1,
        voltageR: '230',
        currentR: '12',
        duration_seconds: 7850,
      }),
      { evseCapacity: 4 },
    );

    expect(telemetry.cpStatusText).toBe('CONNECTED (Waiting Authentication)');
    expect(telemetry.duration).toBe('02:10:50');
    expect(telemetry.evseCapacityText).toBe('22 kW');
  });

  it('returns stable fallbacks for unavailable or invalid data', () => {
    const telemetry = parseDashboardMessage('not-json');

    expect(telemetry.duration).toBe('00:00:00');
    expect(telemetry.power).toBe(0);
    expect(telemetry.temperature).toBeUndefined();
    expect(telemetry.cpStatusText).toBe('UNKNOWN');
  });

  it('exposes all requested status, capacity, and fault mappings', () => {
    expect(getCpStatusString(6)).toBe('CP ERROR');
    expect(getEvseCapacityText(3)).toBe('11 kW');
    expect(getActiveFaults(2 ** 14)).toEqual(['rcdTestFailed']);
  });
});
