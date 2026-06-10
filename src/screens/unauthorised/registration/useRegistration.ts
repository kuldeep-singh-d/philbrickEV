import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { routes } from '@routes';
import helpers, { show } from '@utils/helpers';
import useStyles from './styles';
import { useDispatch, useSelector } from '@hooks';
import { register } from '@store/slices/auth/register';
import { setLoginState } from '@store/slices/localStates/loginState';
import { getApiFieldError } from '@utils/apiError';
import { getMobileDeviceDescriptor } from '@utils/mobileDevice';
import {
  clearRegistrationOtpRes,
  resendRegistrationOtp,
  sendRegistrationOtp,
} from '@store/slices/auth/registrationOtp';

export const useRegistration = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const registerRequestRef = useRef(false);
  const otpRequestRef = useRef(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [preparingDevice, setPreparingDevice] = useState(false);
  const registerResponse = useSelector(state => state.register);
  const registrationOtpResponse = useSelector(state => state.registrationOtp);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFullName = fullName.trim();
  const normalizedUsername = username.trim();
  const canVerifyEmail = useMemo(
    () => helpers.isValidEmail(normalizedEmail),
    [normalizedEmail],
  );
  const otpReady = /^\d{6}$/.test(otp.trim());

  const normalizedPhone = useMemo(() => {
    const digits = mobileNumber.replace(/\D/g, '');

    if (digits.length === 10) {
      return `+1${digits}`;
    }

    return digits.startsWith('1') ? `+${digits}` : mobileNumber.trim();
  }, [mobileNumber]);

  useEffect(() => {
    if (!registerRequestRef.current || !registerResponse.data) {
      return;
    }

    registerRequestRef.current = false;
    show.success(
      registerResponse.data?.message || 'Registration successful.',
    );
    dispatch(setLoginState(true));
  }, [dispatch, registerResponse.data]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
  }, []);

  useEffect(() => {
    if (!otpRequestRef.current || !registrationOtpResponse.data) {
      return;
    }

    otpRequestRef.current = false;
    setOtpSent(true);
    setOtp('');
    setOtpError('');
    show.success(registrationOtpResponse.data?.message || 'OTP sent.');
  }, [registrationOtpResponse.data]);

  useEffect(() => {
    if (!registrationOtpResponse.error) {
      return;
    }

    otpRequestRef.current = false;
    setEmailError(getApiFieldError(registrationOtpResponse.error, 'email'));
  }, [registrationOtpResponse.error]);

  useEffect(() => {
    if (!registerResponse.error) {
      return;
    }

    registerRequestRef.current = false;
    setFullNameError(getApiFieldError(registerResponse.error, 'name'));
    setUsernameError(getApiFieldError(registerResponse.error, 'username'));
    setEmailError(getApiFieldError(registerResponse.error, 'email'));
    setMobileNumberError(getApiFieldError(registerResponse.error, 'phone'));
    setPasswordError(getApiFieldError(registerResponse.error, 'password'));
    setOtpError(getApiFieldError(registerResponse.error, 'otp'));
  }, [registerResponse.error]);

  useEffect(
    () => () => {
      dispatch(clearRegistrationOtpRes());
    },
    [dispatch],
  );

  const handleSendOtp = useCallback(() => {
    if (
      !canVerifyEmail ||
      registrationOtpResponse.loading ||
      otpRequestRef.current
    ) {
      return;
    }

    otpRequestRef.current = true;
    setOtp('');
    setOtpError('');
    dispatch(clearRegistrationOtpRes());
    dispatch(sendRegistrationOtp({ email: normalizedEmail }));
  }, [
    canVerifyEmail,
    dispatch,
    normalizedEmail,
    registrationOtpResponse.loading,
  ]);

  const handleResendOtp = useCallback(() => {
    if (
      !canVerifyEmail ||
      registrationOtpResponse.loading ||
      otpRequestRef.current
    ) {
      return;
    }

    otpRequestRef.current = true;
    setOtp('');
    setOtpError('');
    dispatch(clearRegistrationOtpRes());
    dispatch(resendRegistrationOtp({ email: normalizedEmail }));
  }, [
    canVerifyEmail,
    dispatch,
    normalizedEmail,
    registrationOtpResponse.loading,
  ]);

  const handleRegister = useCallback(async () => {
    let valid = true;
    if (!normalizedFullName) {
      setFullNameError('Full name is required');
      valid = false;
    }

    if (!normalizedUsername) {
      setUsernameError('Username is required');
      valid = false;
    } else if (!/^[A-Za-z0-9_-]{3,32}$/.test(normalizedUsername)) {
      setUsernameError('Use 3-32 letters, numbers, dash, or underscore');
      valid = false;
    }

    if (!normalizedEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!helpers.isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else if (!otpSent) {
      setEmailError('Please request an OTP');
      valid = false;
    }

    if (!otpReady) {
      setOtpError('Enter the 6-digit OTP');
      valid = false;
    }

    if (!mobileNumber.trim()) {
      setMobileNumberError('Mobile number is required');
      valid = false;
    } else if (!helpers.numberValidation(mobileNumber.trim())) {
      setMobileNumberError('Enter a valid mobile number');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!valid || registerResponse.loading || preparingDevice) return;

    setPreparingDevice(true);

    try {
      const device = await getMobileDeviceDescriptor();
      registerRequestRef.current = true;
      dispatch(
        register({
          name: normalizedFullName,
          username: normalizedUsername,
          email: normalizedEmail,
          phone: normalizedPhone,
          password,
          otp: otp.trim(),
          device,
          password_confirmation: confirmPassword,
        }),
      );
    } finally {
      setPreparingDevice(false);
    }
  }, [
    dispatch,
    normalizedFullName,
    normalizedUsername,
    normalizedEmail,
    otp,
    otpReady,
    otpSent,
    mobileNumber,
    normalizedPhone,
    password,
    confirmPassword,
    preparingDevice,
    registerResponse.loading,
  ]);

  const handleGoToLogin = useCallback(() => {
    navigation.navigate(routes.auth.login);
  }, [navigation]);

  return {
    styles,
    states: {
      fullName,
      username,
      email,
      otp,
      otpSent,
      mobileNumber,
      password,
      confirmPassword,
      fullNameError,
      usernameError,
      emailError,
      otpError,
      mobileNumberError,
      passwordError,
      confirmPasswordError,
      canVerifyEmail,
      otpReady,
      otpLoading: Boolean(registrationOtpResponse.loading),
      registrationLoading: Boolean(
        registerResponse.loading || preparingDevice,
      ),
    },
    handlers: {
      setFullName,
      setUsername,
      setEmail: handleEmailChange,
      setOtp,
      setMobileNumber,
      setPassword,
      setConfirmPassword,
      setFullNameError,
      setUsernameError,
      setEmailError,
      setOtpError,
      setMobileNumberError,
      setPasswordError,
      setConfirmPasswordError,
      handleSendOtp,
      handleResendOtp,
      handleRegister,
      handleGoToLogin,
    },
    constants: {
      iconSize: 20,
    },
  };
};

export default useRegistration;
