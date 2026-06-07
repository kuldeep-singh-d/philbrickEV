import React from 'react';
import { Svgs } from '@assets/svgs';
import { images } from '@assets/imgaes';
import { useForgotPass } from './useForgotPass';
import { ImageBackground, Pressable, View, StatusBar } from 'react-native';
import { AppButton, AppInput, AppText, KeyboardAvoider } from '@components';

export const ForgotPass = () => {
  const { styles, states, handlers, constants } = useForgotPass();

  return (
    <ImageBackground source={images.authBG} style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        showHideTransition={'fade'}
      />
      <KeyboardAvoider contentContainerStyle={styles.scrollContent}>
        <View style={styles.containerBody}>
          <AppText
            semibold
            numberOfLines={2}
            style={styles.heading}
            label="Update your password"
          />

          {!states.otpVerified && (
            <AppInput
              title="Email"
              gradientBorder
              value={states.email}
              autoComplete="email"
              error={states.emailError}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="example@gmail.com"
              onChangeText={handlers.setEmail}
              setError={handlers.setEmailError}
              leftIcon={
                <Svgs.Mail
                  width={constants.iconSize}
                  height={constants.iconSize}
                />
              }
            />
          )}

          {!states.otpSent && !states.otpVerified && (
            <AppButton
              title="Get OTP"
              loader={states.loading}
              style={styles.sendButton}
              onPress={handlers.handleGetOtp}
              disabled={states.loading || !states.canRequestOtp}
            />
          )}

          {states.otpSent && (
            <AppInput
              title="OTP"
              gradientBorder
              value={states.otp}
              maxLength={6}
              error={states.otpError}
              keyboardType="number-pad"
              placeholder="Enter OTP"
              onChangeText={handlers.setOtp}
              setError={handlers.setOtpError}
              rightElement={
                <Pressable
                  hitSlop={10}
                  style={styles.inputAction}
                  onPress={handlers.handleVerifyOtp}
                >
                  <AppText
                    semibold
                    label="Verify"
                    style={styles.inputActionText}
                  />
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
                error={states.newPasswordError}
                textContentType="newPassword"
                placeholder="Enter new password"
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
                title="Confirm Password"
                textContentType="newPassword"
                value={states.confirmPassword}
                error={states.confirmPasswordError}
                placeholder="Confirm new password"
                onChangeText={handlers.setConfirmPassword}
                setError={handlers.setConfirmPasswordError}
                leftIcon={
                  <Svgs.Lock
                    width={constants.iconSize}
                    height={constants.iconSize}
                  />
                }
              />

              <AppButton
                title="Update Password"
                loader={states.loading}
                disabled={states.loading}
                style={styles.sendButton}
                onPress={handlers.handleUpdatePassword}
              />
            </>
          )}

          <Pressable
            style={styles.backButton}
            onPress={handlers.handleGoToLogin}
          >
            <AppText centered style={styles.backText} label="Back to Login" />
          </Pressable>
        </View>
      </KeyboardAvoider>
    </ImageBackground>
  );
};
