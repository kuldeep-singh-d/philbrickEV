type ApiErrorFields = Record<string, string[] | string | undefined>;

export interface ApiErrorResponse {
  message?: string;
  error?: ApiErrorFields;
  errors?: ApiErrorFields;
}

const getFields = (response?: ApiErrorResponse) =>
  response?.error || response?.errors;

export const getApiFieldError = (
  response: ApiErrorResponse | undefined,
  field: string,
) => {
  const value = getFields(response)?.[field];

  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return typeof value === 'string' ? value : '';
};

export const getApiErrorMessage = (
  response: ApiErrorResponse | undefined,
  fallback = 'Something went wrong',
) => {
  const fields = getFields(response);
  const firstFieldError = fields
    ? Object.values(fields).find(value =>
        Array.isArray(value) ? value.length > 0 : Boolean(value),
      )
    : undefined;

  if (Array.isArray(firstFieldError)) {
    return firstFieldError[0] || response?.message || fallback;
  }

  return firstFieldError || response?.message || fallback;
};
