import { useCallback, useState } from 'react';

import { show } from '@utils/helpers';

import useStyles from './styles';

export const useUpdatePassword = () => {
  const styles = useStyles();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = useCallback(() => {
    let valid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Old password is required');
      valid = false;
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      valid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      valid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError('New password must be different');
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

    // Future API integration can submit the password update here.
    setLoading(false);
    show.success('Password updated locally.');
  }, [confirmPassword, currentPassword, loading, newPassword]);

  const handleForgotPassword = useCallback(() => {
    show.warn('Password recovery will be available soon.');
  }, []);

  return {
    styles,
    states: {
      currentPassword,
      newPassword,
      confirmPassword,
      currentPasswordError,
      newPasswordError,
      confirmPasswordError,
      loading,
    },
    handlers: {
      setCurrentPassword,
      setNewPassword,
      setConfirmPassword,
      setCurrentPasswordError,
      setNewPasswordError,
      setConfirmPasswordError,
      handleUpdatePassword,
      handleForgotPassword,
    },
    constants: { iconSize: 22 },
  };
};

export default useUpdatePassword;
