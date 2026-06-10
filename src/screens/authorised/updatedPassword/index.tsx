import React from 'react';
import { Pressable } from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppButton, AppInput, AppText } from '@components';
import AuthorisedScreen from '../components/AuthorisedScreen';

import { useUpdatePassword } from './useUpdatePassword';

export const UpdatePassword = () => {
  const { styles, states, handlers, constants } = useUpdatePassword();

  return (
    <AuthorisedScreen contentStyle={styles.content}>
      <AppText semibold label="Updated Password" style={styles.heading} />

      {!states.otpVerified && (
        <AppInput
          title="Email"
          gradientBorder
          value={states.email}
          autoComplete="email"
          error={states.emailError}
          returnKeyType="next"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="example@gmail.com"
          onChangeText={handlers.setEmail}
          setError={handlers.setEmailError}
          leftIcon={
            <Svgs.Mail width={constants.iconSize} height={constants.iconSize} />
          }
        />
      )}

      {!states.otpSent && !states.otpVerified && (
        <AppButton
          title="Get OTP"
          loader={states.loading}
          disabled={states.loading || !states.canRequestOtp}
          onPress={handlers.handleGetOtp}
        />
      )}

      {states.otpSent && (
        <AppInput
          title="OTP"
          maxLength={6}
          gradientBorder
          value={states.otp}
          error={states.otpError}
          returnKeyType="done"
          keyboardType="number-pad"
          placeholder="Enter OTP"
          onChangeText={handlers.setOtp}
          setError={handlers.setOtpError}
          onSubmitEditing={handlers.handleVerifyOtp}
          rightElement={
            <Pressable
              hitSlop={10}
              style={styles.inputAction}
              onPress={handlers.handleVerifyOtp}
            >
              <AppText semibold label="Verify" style={styles.inputActionText} />
            </Pressable>
          }
        />
      )}

      {states.otpVerified && (
        <>
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
              <Svgs.Lock
                width={constants.iconSize}
                height={constants.iconSize}
              />
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
              <Svgs.Lock
                width={constants.iconSize}
                height={constants.iconSize}
              />
            }
          />

          <AppButton
            title="Update"
            loader={states.loading}
            disabled={states.loading}
            onPress={handlers.handleUpdatePassword}
          />
        </>
      )}

      {/* <Pressable
        hitSlop={10}
        style={styles.forgotButton}
        onPress={handlers.handleForgotPassword}
      >
        <AppText
          centered
          style={styles.forgotText}
          label="Forgot your old password?"
        />
      </Pressable> */}
    </AuthorisedScreen>
  );
};

export default UpdatePassword;
