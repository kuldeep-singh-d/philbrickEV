import axios from 'axios';
// Internal Imports
import { BASE_URL } from '@env';
import { show } from '@utils/helpers';
import { getApiErrorMessage } from '@utils/apiError';
import * as actions from '@store/apiActions';
import { clearLoginRes } from '@store/slices/auth/login';
import { clearLogoutResponse } from '@store/slices/auth/logout';
import { setLoginState } from '@store/slices/localStates/loginState';
import { handalLoading } from '@store/slices/localStates/handalLoading';

interface ApiMiddlewareArgs {
  dispatch: React.Dispatch<any>;
  getState: () => StoreState;
}

// Define common types for action payloads and request options
interface ApiCallPayload {
  data?: any;
  params?: Record<string, unknown>;
  url: string;
  method: string;
  onStart?: string;
  onFailed?: string;
  onReset?: string;
  onSuccess?: string;
  formData?: boolean;
  isRowData?: boolean;
  authHeader?: boolean;
  isUrlencoded?: boolean;
  headers?: Record<string, string>;
  dedupe?: boolean;
}

interface AxiosRequestConfig {
  data?: any;
  params?: Record<string, unknown>;
  url: string;
  method: string;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

type StoreState = any;

const inFlightRequestKeys = new Set<string>();

const normalizeBaseURL = (value?: string) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return '';
  }

  const urlWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  return urlWithProtocol.replace(/\/+$/, '');
};

const isFormDataPayload = (value: unknown): value is FormData =>
  typeof FormData !== 'undefined' && value instanceof FormData;

const buildRequestKey = (config: AxiosRequestConfig) => {
  try {
    return JSON.stringify({
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
    });
  } catch {
    return `${config.method}:${config.baseURL}:${config.url}`;
  }
};

const api =
  ({ dispatch, getState }: ApiMiddlewareArgs) =>
  (next: any) =>
  async (action: any) => {
    if (action.type !== actions.apiCallBegan.type) return next(action);

    const {
      url,
      data,
      params,
      method,
      onStart,
      onReset,
      onFailed,
      onSuccess,
      headers: extraHeaders,
      dedupe = false,
      isRowData = false,
    }: ApiCallPayload = action.payload;

    if (!url) {
      // console.warn('[API Middleware] No URL provided.');
      next(action);
      return;
    }

    const store = getState();
    const token =
      store?.login?.data?.data?.token || store?.register?.data?.data?.token;
    const baseURL = normalizeBaseURL(
      store?.setEnvironment?.data?.domain || BASE_URL,
    );
    // console.log('[API] baseURL:', baseURL);
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (isRowData) {
      headers['Content-Type'] = 'application/json';
    } else if (!isFormDataPayload(data)) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    // Conditionally attach Authorization header when token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    Object.assign(headers, extraHeaders);

    if (!baseURL) {
      const errorMessage = 'API base URL is not configured.';

      show.error(errorMessage);
      dispatch(actions.apiCallFailed({ message: errorMessage } as any));
      if (onFailed) {
        dispatch({ type: onFailed, payload: { message: errorMessage } });
      }
      dispatch(handalLoading(false));
      return;
    }

    const requestConfig: AxiosRequestConfig = {
      url,
      data,
      params,
      method,
      headers,
      timeout: 30000,
      baseURL,
    };

    const requestKey = dedupe ? buildRequestKey(requestConfig) : '';

    if (requestKey && inFlightRequestKeys.has(requestKey)) {
      return;
    }

    if (requestKey) {
      inFlightRequestKeys.add(requestKey);
    }

    if (onStart) dispatch({ type: onStart });
    next(action);

    try {
      const response = await axios.request(requestConfig);
      const responseData = response?.data;
      // console.log(url + ' Response=>>\n', response);
      // Check for API-specific failure even on 200 status
      if (responseData?.success === false) {
        const apiError = getApiErrorMessage(responseData);

        show.error(apiError);
        console.log('[success == false]', responseData);

        if (onFailed) {
          dispatch({ type: onFailed, payload: responseData });
        }
        dispatch(actions.apiCallFailed(responseData));

        dispatch(handalLoading(false));
        if (onReset) dispatch({ type: onReset });

        return;
      }

      // Dispatch success
      dispatch(actions.apiCallSuccess(responseData));

      dispatch(handalLoading(false));

      if (onSuccess) dispatch({ type: onSuccess, payload: responseData });
    } catch (error: any) {
      console.log(url, '[error]', error?.response || error);
      const statusCode = error?.response?.status;
      const responseData = error?.response?.data;

      const errorMessage = !statusCode
        ? 'Network Error.'
        : getApiErrorMessage(
            responseData,
            `Server Message: ${statusCode}, Something went wrong`,
          );

      // Handle common auth/session-related errors
      if (statusCode === 401) {
        show.error(`${statusCode}: Unauthorized`);
        // dispatch(logout());
        dispatch(clearLoginRes());
        dispatch(setLoginState(false));
        dispatch(clearLogoutResponse());
      } else if (statusCode === 503) {
        // Maintenance message only
        show.error('Server under maintenance');
      } else {
        show.error(errorMessage);
      }
      // console.log('[API Error]', error?.response || error);

      dispatch(actions.apiCallFailed(error));
      if (onFailed) {
        dispatch({
          type: onFailed,
          payload: responseData || { message: errorMessage },
        });
      }

      dispatch(handalLoading(false));
    } finally {
      if (requestKey) {
        inFlightRequestKeys.delete(requestKey);
      }
    }
  };

export default api;
