import axios from 'axios';
// Internal Imports
import { BASE_URL } from '@env';
import { show } from '@utils/helpers';
import * as actions from '@store/apiActions';
import { clearLoginRes } from '@store/slices/auth/login';
import { setLoginState } from '@store/slices/localStates/loginState';
import { clearLogoutResponse } from '@store/slices/auth/logout';
import { handalLoading } from '@store/slices/localStates/handalLoading';

interface ApiMiddlewareArgs {
  dispatch: React.Dispatch<any>;
  getState: () => StoreState;
}

// Define common types for action payloads and request options
interface ApiCallPayload {
  data?: any;
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
}

interface AxiosRequestConfig {
  data?: any;
  url: string;
  method: string;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

type StoreState = any;

const api =
  ({ dispatch, getState }: ApiMiddlewareArgs) =>
  (next: any) =>
  async (action: any) => {
    if (action.type !== actions.apiCallBegan.type) return next(action);

    const {
      url,
      data,
      method,
      onStart,
      onReset,
      onFailed,
      onSuccess,
      isRowData = false,
    }: ApiCallPayload = action.payload;

    if (onStart) dispatch({ type: onStart });
    next(action);

    if (!url) {
      // console.warn('[API Middleware] No URL provided.');
      return;
    }

    const store = getState();
    const token = store?.login?.data?.data?.token;
    const baseURL = store?.setEnvironment?.data?.domain || BASE_URL;
    // console.log('[API] baseURL:', baseURL);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': isRowData ? 'application/json' : 'multipart/form-data',
    };

    // Conditionally attach Authorization header when token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const requestConfig: AxiosRequestConfig = {
      url,
      data,
      method,
      headers,
      timeout: 30000,
      baseURL,
    };
    console.log('requestConfig=>', requestConfig);
    try {
      const response = await axios.request(requestConfig);
      const responseData = response?.data;
      console.log(url + ' Response=>>\n', response);
      // Check for API-specific failure even on 200 status
      if (responseData?.data?.success === false) {
        const apiError = responseData?.data?.message || 'Something went wrong';

        show.error(apiError);
        console.log('[success == false]', responseData);

        dispatch({ type: onFailed, payload: apiError });
        dispatch(actions.apiCallFailed(apiError));

        dispatch(handalLoading(false));
        if (onReset) dispatch({ type: onReset });

        return;
      }

      // Dispatch success
      dispatch(actions.apiCallSuccess(responseData));

      dispatch(handalLoading(false));

      if (onSuccess) dispatch({ type: onSuccess, payload: responseData });
    } catch (error: any) {
      console.log(url, '[error]', error);
      const statusCode = error?.response?.status;
      const serverMessage = error?.response?.data?.message;

      let errorMessage;
      if (!statusCode) {
        errorMessage = 'Network Error.';
      } else {
        errorMessage =
          serverMessage ||
          `Server Message: ${statusCode}, ${'Something went wrong'}`;
      }

      // Handle common auth/session-related errors
      if (statusCode === 401) {
        show.error(`${statusCode}: Unauthorized`);
        // dispatch(logout());
        dispatch(clearLoginRes());
        dispatch(setLoginState(false));
        dispatch(clearLogoutResponse());
      } else if (statusCode === 400) {
        show.warn('Your session has expired. Please log in again.');
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
        dispatch({ type: onFailed, payload: errorMessage });
      }

      dispatch(handalLoading(false));
    }
  };

export default api;
