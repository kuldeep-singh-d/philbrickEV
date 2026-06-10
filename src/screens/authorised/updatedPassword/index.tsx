import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { Svgs } from '@assets/svgs';
import { AppButton, AppInput, AppText } from '@components';
import AuthorisedScreen from '../../../components/container/AuthorisedScreen';

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
          editable={!states.emailLocked}
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
              disabled={states.loading || states.otpExpired}
              style={styles.inputAction}
              onPress={handlers.handleVerifyOtp}
            >
              {states.loading ? (
                <ActivityIndicator size="small" color="#0BB2C3" />
              ) : (
                <AppText
                  semibold
                  label="Verify"
                  style={styles.inputActionText}
                />
              )}
            </Pressable>
          }
        />
      )}

      {states.otpSent && (
        <>
          {states.otpExpired ? (
            <Pressable
              hitSlop={10}
              disabled={states.loading}
              style={styles.resendOtpButton}
              onPress={handlers.handleResendOtp}
            >
              <AppText
                semibold
                centered
                label="Resend OTP"
                style={styles.inputActionText}
              />
            </Pressable>
          ) : (
            <AppText
              centered
              style={styles.otpTimerText}
              label={`This code will expire in ${states.otpCountdown} minutes.`}
            />
          )}
        </>
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

    </AuthorisedScreen>
  );
};

export default UpdatePassword;
