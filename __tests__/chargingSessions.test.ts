import reducer, {
  fetchChargingSessions,
  selectChargingSessions,
  success,
} from '../src/store/slices/devices/chargingSessions';
import { methods } from '../src/store/apiRoutes';

describe('charging sessions API state', () => {
  it('builds the charging history request as a query-param GET', () => {
    const action = fetchChargingSessions({
      deviceId: 1,
      page: 1,
      perPage: 25,
    });

    expect(action.payload).toMatchObject({
      isRowData: true,
      method: methods.GET,
      url: '/api/v1/charging-sessions',
      params: {
        device_id: 1,
        per_page: 25,
        page: 1,
      },
    });
    expect(action.payload?.data).toBeUndefined();
  });

  it('selects sessions from common paginated response envelopes', () => {
    const rows = [{ id: 1 }, { id: 2 }];

    expect(selectChargingSessions({ data: { data: rows } })).toEqual(rows);
    expect(
      selectChargingSessions({
        data: { charging_sessions: { data: rows } },
      }),
    ).toEqual(rows);
    expect(
      selectChargingSessions({
        success: true,
        data: {
          sessions: rows,
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 2,
          },
        },
      }),
    ).toEqual(rows);
    expect(selectChargingSessions({ charging_sessions: rows })).toEqual(rows);
  });

  it('stores sessions from the current API response shape', () => {
    const state = reducer(
      undefined,
      success({
        success: true,
        message: 'OK',
        data: {
          sessions: [
            {
              id: 4,
              device_id: 1,
              started_at: '2026-06-26T23:44:10+00:00',
              ended_at: '2026-06-26T18:14:07+00:00',
              duration_seconds: 338,
            },
          ],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 1,
          },
        },
      }),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(4);
    expect(state.page).toBe(1);
    expect(state.hasMore).toBe(false);
  });

  it('appends subsequent paginated pages', () => {
    const firstPage = reducer(
      undefined,
      success({
        data: {
          current_page: 1,
          last_page: 2,
          data: [{ id: 1 }],
        },
      }),
    );
    const secondPage = reducer(
      firstPage,
      success({
        data: {
          current_page: 2,
          last_page: 2,
          data: [{ id: 2 }],
        },
      }),
    );

    expect(secondPage.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(secondPage.page).toBe(2);
    expect(secondPage.hasMore).toBe(false);
  });
});
