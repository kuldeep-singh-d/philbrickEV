import { routes } from '@routes';
import { useStyles } from './styles';
import { login } from '@store/slices/auth/login';
import { useDispatch, useSelector } from '@hooks';
import { getApiFieldError } from '@utils/apiError';
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getMobileDeviceDescriptor } from '@utils/mobileDevice';
import { setLoginState } from '@store/slices/localStates/loginState';

export const useLogin = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const loginResponse = useSelector(state => state.login);

  const navigation: any = useNavigation();
  const [identifier, setIdentifier] = useState('ksdahiya5085@gmail.com');
  const [password, setPassword] = useState('P@ssw0rd');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [preparingDevice, setPreparingDevice] = useState(false);

  useEffect(() => {
    const token = loginResponse.data?.data?.token;

    if (!token) {
      return;
    }

    dispatch(setLoginState(true));
  }, [dispatch, loginResponse.data]);

  useEffect(() => {
    if (!loginResponse.error) {
      return;
    }

    setIdentifierError(
      getApiFieldError(loginResponse.error, 'identifier') ||
        getApiFieldError(loginResponse.error, 'device'),
    );
    setPasswordError(getApiFieldError(loginResponse.error, 'password'));
  }, [loginResponse.error]);

  const handleLogin = useCallback(async () => {
    const normalizedIdentifier = identifier.trim();
    let valid = true;

    if (!normalizedIdentifier) {
      setIdentifierError('Username, email, or phone is required');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!valid || loginResponse.loading || preparingDevice) {
      return;
    }

    setPreparingDevice(true);

    try {
      const device = await getMobileDeviceDescriptor();
      dispatch(login({ identifier: normalizedIdentifier, password, device }));
    } finally {
      setPreparingDevice(false);
    }
  }, [dispatch, identifier, loginResponse.loading, password, preparingDevice]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate(routes.auth.forgotPassword);
  }, [navigation]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate(routes.auth.registration);
  }, [navigation]);

  return {
    styles,
    states: {
      identifier,
      password,
      identifierError,
      passwordError,
      loading: Boolean(loginResponse.loading || preparingDevice),
    },
    handlers: {
      setIdentifier,
      setPassword,
      setIdentifierError,
      setPasswordError,
      handleLogin,
      handleForgotPassword,
      handleCreateAccount,
    },
    constants: {
      iconSize: 20,
    },
  };
};
