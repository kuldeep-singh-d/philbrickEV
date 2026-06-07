import { useStyles } from './styles';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { routes } from '@routes';
import { login } from '@store/slices/auth/login';
import { setLoginState } from '@store/slices/localStates/loginState';
import helpers from '@utils/helpers';

export const useLogin = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const loginResponse = useSelector(state => state.login);
  const navigation: any = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const token = loginResponse.data?.data?.token;
    if (token) {
      dispatch(setLoginState(true));
    }
  }, [dispatch, loginResponse.data]);

  const handleLogin = useCallback(() => {
    const normalizedEmail = email.trim().toLowerCase();
    let valid = true;

    if (!normalizedEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!helpers.isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!valid || loginResponse.loading) {
      return;
    }

    const formData = new FormData();
    formData.append('email', normalizedEmail);
    formData.append('password', password);
    dispatch(login(formData));
  }, [dispatch, email, loginResponse.loading, password]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate(routes.auth.forgotPassword);
  }, [navigation]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate(routes.auth.registration);
  }, [navigation]);

  return {
    styles,
    states: {
      email,
      password,
      emailError,
      passwordError,
      loading: Boolean(loginResponse.loading),
    },
    handlers: {
      setEmail,
      setPassword,
      setEmailError,
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
