import axios from 'axios';

import { apiCallBegan } from '../src/store/apiActions';
import api from '../src/store/middleware/api';

jest.mock('axios');
jest.mock('../src/utils/helpers', () => ({
  __esModule: true,
  show: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API middleware auth errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes the backend field-error envelope to the failed reducer', async () => {
    const response = {
      success: false,
      message: 'The given data was invalid.',
      error: {
        identifier: ['These credentials do not match our records.'],
      },
    };
    mockedAxios.request.mockRejectedValueOnce({
      response: { status: 422, data: response },
    });

    const dispatch = jest.fn();
    const next = jest.fn();
    const run = api({
      dispatch,
      getState: () => ({}),
    } as any)(next);

    await run(
      apiCallBegan({
        url: '/api/v1/auth/login',
        method: 'POST',
        onFailed: 'login/failed',
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: 'login/failed',
      payload: response,
    });
  });

  it('passes local state actions without URLs to the next middleware', async () => {
    const action = apiCallBegan({
      data: true as any,
      onChange: 'login-state/onChange',
    });
    const dispatch = jest.fn();
    const next = jest.fn();
    const run = api({
      dispatch,
      getState: () => ({}),
    } as any)(next);

    await run(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(mockedAxios.request).not.toHaveBeenCalled();
  });
});
