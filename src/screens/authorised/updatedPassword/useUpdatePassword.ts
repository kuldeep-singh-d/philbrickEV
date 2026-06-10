import { useCallback, useMemo, useState } from 'react';

import helpers, { show } from '@utils/helpers';

import useStyles from './styles';

const LOCAL_OTP = '123456';

export const useUpdatePassword = () => {
  const styles = useStyles();

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
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const canRequestOtp = useMemo(
    () => helpers.isValidEmail(normalizedEmail) && !otpVerified,
    [normalizedEmail, otpVerified],
  );

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailError('');
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  }, []);

  const handleGetOtp = useCallback(() => {
    let valid = true;

    if (!normalizedEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!helpers.isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!valid || loading) {
      return;
    }

    setLoading(true);

    // Future API integration: request password reset OTP for normalizedEmail.
    setOtp('');
    setOtpError('');
    setOtpSent(true);
    setOtpVerified(false);
    setLoading(false);
    show.success(`OTP sent to ${normalizedEmail}. Use ${LOCAL_OTP} for now.`);
  }, [loading, normalizedEmail]);

  const handleVerifyOtp = useCallback(() => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    // Future API integration: verify OTP and store reset token from response.
    if (otp.trim() !== LOCAL_OTP) {
      setOtpError('Invalid OTP');
      return;
    }

    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setOtpVerified(true);
    show.success('OTP verified.');
  }, [otp]);

  const handleUpdatePassword = useCallback(() => {
    let valid = true;

    if (!newPassword) {
      setNewPasswordError('New password is required');
      valid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      valid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!valid || loading) {
      return;
    }

    setLoading(true);

    // Future API integration: submit reset token, new password, and confirmation.
    setLoading(false);
    show.success('Password updated locally.');
  }, [confirmPassword, loading, newPassword]);

  const handleForgotPassword = useCallback(() => {
    handleEmailChange('');
  }, [handleEmailChange]);

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
      loading,
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
      handleForgotPassword,
    },
    constants: { iconSize: 22 },
  };
};

export default useUpdatePassword;
