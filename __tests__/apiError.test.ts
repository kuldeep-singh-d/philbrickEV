import {
  getApiErrorMessage,
  getApiFieldError,
} from '../src/utils/apiError';

describe('API error helpers', () => {
  it('reads field errors from the current error envelope', () => {
    const response = {
      success: false,
      message: 'The given data was invalid.',
      error: {
        identifier: ['These credentials do not match our records.'],
      },
    };

    expect(getApiFieldError(response, 'identifier')).toBe(
      'These credentials do not match our records.',
    );
    expect(getApiErrorMessage(response)).toBe(
      'These credentials do not match our records.',
    );
  });

  it('supports the legacy errors envelope and message fallback', () => {
    expect(
      getApiFieldError(
        { errors: { email: ['The email has already been taken.'] } },
        'email',
      ),
    ).toBe('The email has already been taken.');

    expect(getApiErrorMessage({ message: 'Unauthenticated.' })).toBe(
      'Unauthenticated.',
    );
  });
});
