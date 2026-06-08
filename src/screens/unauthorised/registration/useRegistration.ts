import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { routes } from '@routes';
import helpers, { show } from '@utils/helpers';
import useStyles from './styles';
import { useDispatch, useSelector } from '@hooks';
import { register } from '@store/slices/auth/register';

const LOCAL_OTP = '123456';

const requestEmailOtp = async (_email: string) => {
  return { otp: LOCAL_OTP };
};

const verifyEmailOtp = async (otp: string) => {
  return otp === LOCAL_OTP;
};

export const useRegistration = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const registerRequestRef = useRef(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const registerResponse = useSelector(state => state.register);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = name.trim();
  const canVerifyEmail = useMemo(
    () => helpers.isValidEmail(normalizedEmail) && !emailVerified,
    [emailVerified, normalizedEmail],
  );

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
    show.success('Registration successful');

    navigation.navigate(routes.auth.login);
  }, [navigation, registerResponse.data]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailVerified(false);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!canVerifyEmail) {
      return;
    }

    const result = await requestEmailOtp(normalizedEmail);
    setOtpSent(true);
    setOtp('');
    setOtpError('');
    show.success(`OTP sent to ${normalizedEmail}. Use ${result.otp} for now.`);
  }, [canVerifyEmail, normalizedEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    const verified = await verifyEmailOtp(otp.trim());
    if (!verified) {
      setOtpError('Invalid OTP');
      return;
    }

    setEmailVerified(true);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    show.success('Email verified successfully');
  }, [otp]);

  const handleRegister = useCallback(() => {
    let valid = true;
    if (!normalizedUsername) {
      setNameError('Username is required');
      valid = false;
    } else if (!/^[A-Za-z0-9_-]{3,32}$/.test(normalizedUsername)) {
      setNameError('Use 3-32 letters, numbers, dash, or underscore');
      valid = false;
    }

    if (!normalizedEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!helpers.isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else if (!emailVerified) {
      setEmailError('Please verify your email');
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

    if (!valid) return;

    registerRequestRef.current = true;
    dispatch(
      register({
        name: normalizedUsername,
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
        password_confirmation: confirmPassword,
      }),
    );
  }, [
    dispatch,
    normalizedUsername,
    normalizedEmail,
    emailVerified,
    mobileNumber,
    normalizedPhone,
    password,
    confirmPassword,
  ]);

  const handleGoToLogin = useCallback(() => {
    navigation.navigate(routes.auth.login);
  }, [navigation]);

  return {
    styles,
    states: {
      name,
      email,
      otp,
      otpSent,
      emailVerified,
      mobileNumber,
      password,
      confirmPassword,
      nameError,
      emailError,
      otpError,
      mobileNumberError,
      passwordError,
      confirmPasswordError,
      canVerifyEmail,
      loading: Boolean(registerResponse.loading),
    },
    handlers: {
      setName,
      setEmail: handleEmailChange,
      setOtp,
      setMobileNumber,
      setPassword,
      setConfirmPassword,
      setNameError,
      setEmailError,
      setOtpError,
      setMobileNumberError,
      setPasswordError,
      setConfirmPasswordError,
      handleSendOtp,
      handleVerifyOtp,
      handleRegister,
      handleGoToLogin,
    },
    constants: {
      iconSize: 20,
    },
  };
};

export default useRegistration;
