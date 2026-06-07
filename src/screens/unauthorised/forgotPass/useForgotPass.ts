import { routes } from '@routes';
import useStyles from './styles';
import helpers, { show } from '@utils/helpers';
import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const LOCAL_OTP = '123456';

const requestPasswordOtp = async (_email: string) => {
  return { otp: LOCAL_OTP };
};

const verifyPasswordOtp = async (otp: string) => {
  return otp === LOCAL_OTP;
};

export const useForgotPass = () => {
  const styles = useStyles();
  const navigation: any = useNavigation();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const canRequestOtp = useMemo(
    () => helpers.isValidEmail(normalizedEmail) && !otpVerified,
    [normalizedEmail, otpVerified],
  );

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  }, []);

  const handleGetOtp = useCallback(async () => {
    let valid = true;

    if (!normalizedEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!helpers.isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!valid) return;

    const result = await requestPasswordOtp(normalizedEmail);
    setOtp('');
    setOtpError('');
    setOtpSent(true);
    setOtpVerified(false);
    show.success(`OTP sent to ${normalizedEmail}. Use ${result.otp} for now.`);
  }, [normalizedEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    const verified = await verifyPasswordOtp(otp.trim());
    if (!verified) {
      setOtpError('Invalid OTP');
      return;
    }

    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setOtpVerified(true);
    show.success('OTP verified successfully');
  }, [otp]);

  const handleUpdatePassword = useCallback(() => {
    let valid = true;

    if (!newPassword) {
      setNewPasswordError('New password is required');
      valid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      valid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    show.success('Password updated successfully');
    navigation.navigate(routes.auth.login);
  }, [confirmPassword, navigation, newPassword]);

  const handleGoToLogin = useCallback(() => {
    navigation.navigate(routes.auth.login);
  }, [navigation]);

  return {
    styles,
    states: {
      email,
      otp,
      otpSent,
      otpVerified,
      newPassword,
      confirmPassword,
      emailError,
      otpError,
      newPasswordError,
      confirmPasswordError,
      canRequestOtp,
      loading: false,
    },
    handlers: {
      setEmail: handleEmailChange,
      setOtp,
      setNewPassword,
      setConfirmPassword,
      setEmailError,
      setOtpError,
      setNewPasswordError,
      setConfirmPasswordError,
      handleGetOtp,
      handleVerifyOtp,
      handleUpdatePassword,
      handleGoToLogin,
    },
    constants: { iconSize: 20 },
  };
};

export default useForgotPass;
