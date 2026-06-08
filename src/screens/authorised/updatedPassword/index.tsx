import React from 'react';
import { Pressable, View } from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppButton, AppInput, AppText } from '@components';
import AuthorisedScreen from '../components/AuthorisedScreen';

import { useUpdatePassword } from './useUpdatePassword';

export const UpdatePassword = () => {
  const { styles, states, handlers, constants } = useUpdatePassword();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Updated Password" style={styles.heading} />

      <AppInput
        isPassword
        gradientBorder
        title="Old Password"
        textContentType="password"
        placeholder="Old Password"
        value={states.currentPassword}
        error={states.currentPasswordError}
        onChangeText={handlers.setCurrentPassword}
        setError={handlers.setCurrentPasswordError}
        leftIcon={
          <Svgs.Lock width={constants.iconSize} height={constants.iconSize} />
        }
      />

      <AppInput
        isPassword
        gradientBorder
        title="New Password"
        value={states.newPassword}
        placeholder="New Password"
        textContentType="newPassword"
        error={states.newPasswordError}
        onChangeText={handlers.setNewPassword}
        setError={handlers.setNewPasswordError}
        leftIcon={
          <Svgs.Lock width={constants.iconSize} height={constants.iconSize} />
        }
      />

      <AppInput
        isPassword
        gradientBorder
        returnKeyType="done"
        title="Confirm Password"
        textContentType="newPassword"
        value={states.confirmPassword}
        placeholder="Confirm Password"
        error={states.confirmPasswordError}
        onChangeText={handlers.setConfirmPassword}
        setError={handlers.setConfirmPasswordError}
        onSubmitEditing={handlers.handleUpdatePassword}
        leftIcon={
          <Svgs.Lock width={constants.iconSize} height={constants.iconSize} />
        }
      />

      <AppButton
        title="Update"
        loader={states.loading}
        disabled={states.loading}
        onPress={handlers.handleUpdatePassword}
      />

      <Pressable
        hitSlop={10}
        style={styles.forgotButton}
        onPress={handlers.handleForgotPassword}
      >
        <AppText
          centered
          style={styles.forgotText}
          label="Forgot your old password?"
        />
      </Pressable>
    </AuthorisedScreen>
  );
};

export default UpdatePassword;
