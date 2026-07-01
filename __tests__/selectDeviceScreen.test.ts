import { shouldFetchDeviceListOnFocus } from '../src/screens/authorised/selecetDevice/useSelectDevice';
import { DEVICE_LIST_CACHE_TTL_MS } from '../src/store/slices/devices/devices';

describe('select device screen fetch behavior', () => {
  it('fetches on first focus only when no previous attempt exists', () => {
    expect(
      shouldFetchDeviceListOnFocus({
        loading: false,
        lastFetchedAt: undefined,
        now: 1000,
      }),
    ).toBe(true);
  });

  it('does not auto-fetch again immediately after an empty or failed response', () => {
    expect(
      shouldFetchDeviceListOnFocus({
        loading: false,
        lastFetchedAt: 1000,
        now: 1000 + DEVICE_LIST_CACHE_TTL_MS - 1,
      }),
    ).toBe(false);
  });

  it('allows automatic refresh again after the cache expires', () => {
    expect(
      shouldFetchDeviceListOnFocus({
        loading: false,
        lastFetchedAt: 1000,
        now: 1000 + DEVICE_LIST_CACHE_TTL_MS + 1,
      }),
    ).toBe(true);
  });

  it('does not dispatch another fetch while a request is already loading', () => {
    expect(
      shouldFetchDeviceListOnFocus({
        loading: true,
        lastFetchedAt: undefined,
        now: 1000,
      }),
    ).toBe(false);
  });
});
