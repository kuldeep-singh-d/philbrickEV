import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { routes } from '@routes';
import helpers, { show } from '@utils/helpers';
import useStyles from './styles';

const LOCAL_OTP = '123456';

const requestEmailOtp = async (_email: string) => {
  return { otp: LOCAL_OTP };
};

const verifyEmailOtp = async (otp: string) => {
  return otp === LOCAL_OTP;
};

export const useRegistration = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();

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

  const normalizedEmail = email.trim().toLowerCase();
  const canVerifyEmail = useMemo(
    () => helpers.isValidEmail(normalizedEmail) && !emailVerified,
    [emailVerified, normalizedEmail],
  );

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
    if (!name.trim()) {
      setNameError('Name is required');
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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    show.warn('Registration is not available yet.');
  }, [
    name,
    normalizedEmail,
    emailVerified,
    mobileNumber,
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
      loading: false,
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
