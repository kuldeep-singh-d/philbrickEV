import { routes } from '@routes';
import useStyles from './styles';
import helpers, { show } from '@utils/helpers';
import { useDispatch, useSelector } from '@hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  clearForgotPasswordRes,
  forgotPassword,
  resendOtp,
} from '@store/slices/auth/forgotPassword';
import { clearVerifyOtpRes, verifyOtp } from '@store/slices/auth/verifyOtp';
import {
  clearResetPasswordRes,
  resetPassword,
} from '@store/slices/auth/resetPassword';
import { getApiFieldError } from '@utils/apiError';

const OTP_EXPIRY_SECONDS = 5 * 60;

export const useForgotPass = () => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const resetRequestRef = useRef(false);
  const otpRequestRef = useRef(false);
  const verifyRequestRef = useRef(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  const forgotPasswordResponse = useSelector(state => state.forgotPassword);
  const verifyOtpResponse = useSelector(state => state.verifyOtp);
  const resetPasswordResponse = useSelector(state => state.resetPassword);

  const normalizedEmail = email.trim().toLowerCase();
  const canRequestOtp = useMemo(
    () => helpers.isValidEmail(normalizedEmail) && !otpVerified,
    [normalizedEmail, otpVerified],
  );
  const otpExpired = otpSent && otpSecondsLeft <= 0;
  const otpCountdown = useMemo(() => {
    const minutes = Math.floor(otpSecondsLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.max(otpSecondsLeft % 60, 0)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${seconds}`;
  }, [otpSecondsLeft]);

  const loading = Boolean(
    forgotPasswordResponse.loading ||
      verifyOtpResponse.loading ||
      resetPasswordResponse.loading,
  );

  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordRes());
      dispatch(clearVerifyOtpRes());
      dispatch(clearResetPasswordRes());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!otpSent || otpVerified || otpSecondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpSecondsLeft(current => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSecondsLeft, otpSent, otpVerified]);

  useEffect(() => {
    if (!otpRequestRef.current || !forgotPasswordResponse.data) {
      return;
    }

    otpRequestRef.current = false;
    setOtp('');
    setOtpError('');
    setOtpSent(true);
    setOtpVerified(false);
    setOtpSecondsLeft(OTP_EXPIRY_SECONDS);
    show.success(
      forgotPasswordResponse.data?.message ||
        'If that email exists, an OTP has been sent.',
    );
  }, [forgotPasswordResponse.data]);

  useEffect(() => {
    if (!verifyRequestRef.current || !verifyOtpResponse.data) {
      return;
    }

    verifyRequestRef.current = false;
    const token = verifyOtpResponse.data?.data?.reset_token || '';
    setResetToken(token);
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setOtpVerified(true);
    setOtpSecondsLeft(0);
    show.success(verifyOtpResponse.data?.message || 'OTP verified.');
  }, [verifyOtpResponse.data]);

  useEffect(() => {
    if (!resetRequestRef.current || !resetPasswordResponse.data) {
      return;
    }

    resetRequestRef.current = false;
    show.success(
      resetPasswordResponse.data?.message ||
        'Password reset successfully. Please log in with your new password.',
    );
    dispatch(clearForgotPasswordRes());
    dispatch(clearVerifyOtpRes());
    dispatch(clearResetPasswordRes());
    navigation.navigate(routes.auth.login);
  }, [dispatch, navigation, resetPasswordResponse.data]);

  useEffect(() => {
    if (forgotPasswordResponse.error) {
      otpRequestRef.current = false;
      setEmailError(
        getApiFieldError(forgotPasswordResponse.error, 'email'),
      );
    }
  }, [forgotPasswordResponse.error]);

  useEffect(() => {
    if (verifyOtpResponse.error) {
      verifyRequestRef.current = false;
      setOtpError(getApiFieldError(verifyOtpResponse.error, 'code'));
    }
  }, [verifyOtpResponse.error]);

  useEffect(() => {
    if (resetPasswordResponse.error) {
      resetRequestRef.current = false;
      setNewPasswordError(
        getApiFieldError(resetPasswordResponse.error, 'password') ||
          getApiFieldError(resetPasswordResponse.error, 'reset_token'),
      );
    }
  }, [resetPasswordResponse.error]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setOtp('');
    setResetToken('');
    setOtpError('');
    setOtpSecondsLeft(0);
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

    otpRequestRef.current = true;
    setOtp('');
    setOtpError('');
    dispatch(clearForgotPasswordRes());
    dispatch(clearVerifyOtpRes());
    dispatch(clearResetPasswordRes());
    dispatch(forgotPassword({ email: normalizedEmail }));
  }, [dispatch, normalizedEmail]);

  const handleResendOtp = useCallback(() => {
    if (loading || !canRequestOtp) {
      return;
    }

    otpRequestRef.current = true;
    setOtp('');
    setOtpError('');
    setOtpSecondsLeft(0);
    dispatch(clearForgotPasswordRes());
    dispatch(clearVerifyOtpRes());
    dispatch(clearResetPasswordRes());
    dispatch(resendOtp({ email: normalizedEmail }));
  }, [canRequestOtp, dispatch, loading, normalizedEmail]);

  const handleVerifyOtp = useCallback(() => {
    if (otpExpired) {
      setOtpError('OTP has expired. Please resend OTP.');
      return;
    }

    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    verifyRequestRef.current = true;
    setOtpError('');
    dispatch(clearVerifyOtpRes());
    dispatch(verifyOtp({ email: normalizedEmail, code: otp.trim() }));
  }, [dispatch, normalizedEmail, otp, otpExpired]);

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

    if (!valid) return;

    if (!resetToken) {
      show.error('Reset token missing. Please verify OTP again.');
      setOtpVerified(false);
      setOtpSent(true);
      setOtpSecondsLeft(0);
      return;
    }

    resetRequestRef.current = true;
    dispatch(clearResetPasswordRes());
    dispatch(
      resetPassword({
        resetToken,
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    );
  }, [confirmPassword, dispatch, newPassword, resetToken]);

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
      otpExpired,
      otpCountdown,
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
      handleResendOtp,
      handleVerifyOtp,
      handleUpdatePassword,
      handleGoToLogin,
    },
    constants: { iconSize: 20 },
  };
};

export default useForgotPass;
