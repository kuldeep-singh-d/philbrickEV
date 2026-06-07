import { GenericState } from '@store/types';
import Toast from 'react-native-toast-message';
import { Linking, Platform } from 'react-native';

const listLimit = 10;

export const show = {
  success: (text1: string) => {
    Toast.show({
      type: 'success',
      text1,
    });
  },
  error: (text1: string) => {
    Toast.show({
      type: 'error',
      text1,
    });
  },
  warn: (text1: string) => {
    Toast.show({
      type: 'warn',
      text1,
    });
  },
};

const numberValidation = (mobnum: string): boolean =>
  /^(\d{3})[- ]?(\d{3})[- ]?(\d{4})$/.test(mobnum);

const isValidEmail = (emailValue: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailValue);
};

const openUrl = (url: string) => {
  try {
    if (url) {
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            if (Platform.OS === 'android') {
              Linking.openURL(url);
            } else {
              show.warn('URL Not Supported');
            }
          }
        })
        .catch(() => {
          show.warn('URL Not Supported');
        });
    } else {
      show.warn('URL not Available');
    }
  } catch {
    show.warn('URL Not Supported');
  }
};

const apiResponseHandler = (
  response: GenericState<any>,
  callback?: (response?: object) => void,
) => {
  if (response?.data) {
    if (response?.data?.message?.error) {
      callback && callback();
      show?.error(response?.data?.message?.error);
    } else if (Array.isArray(response?.data?.message)) {
      return response?.data?.message?.length > 0 ? response?.data?.message : [];
    } else {
      return response?.data?.message || response?.data || false;
    }
  }
  if (response?.error) {
    if (typeof response?.error === 'string') {
      show?.error(response?.error);
    }
    if (typeof response?.error?.message === 'string') {
      show?.error(response?.error?.message);
    }
    if (typeof response?.error?.message?.message === 'string') {
      show?.error(response?.error?.message?.message);
    }
    if (response?.error?._error_message) {
      show?.error(response?.error?._error_message);
      callback && callback(response?.error?._error_message);
    }
    if (response?.error?._server_messages) {
      const err = JSON?.parse?.(response?.error?._server_messages);
      const objError = JSON.parse(err?.[0]);
      show?.error(objError?.message || err?.message);
      return callback && callback(objError?.message || err?.message);
    }
    if (response?.error?.exception) {
      show?.error(response?.error?.exception);
    }
    callback && callback(response?.error);
    return false;
  }

  return false;
};

export default {
  show,
  openUrl,
  listLimit,
  isValidEmail,
  numberValidation,
  apiResponseHandler,
};
