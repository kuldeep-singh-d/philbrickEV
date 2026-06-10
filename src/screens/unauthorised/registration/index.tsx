import React from 'react';
import { Svgs } from '@assets/svgs';
import { images } from '@assets/imgaes';
import useRegistration from './useRegistration';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  View,
  StatusBar,
} from 'react-native';
import { AppButton, AppInput, AppText, KeyboardAvoider } from '@components';

export const Registration = () => {
  const { styles, states, handlers, constants } = useRegistration();

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
            label="Join the Future of Electric Mobility."
          />

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
            rightElement={
              !states.otpSent && states.canVerifyEmail ? (
                <Pressable
                  disabled={states.otpLoading}
                  onPress={handlers.handleSendOtp}
                  style={styles.inputAction}
                >
                  {states.otpLoading ? (
                    <ActivityIndicator size="small" color="#079CDD" />
                  ) : (
                    <AppText
                      semibold
                      label="Send OTP"
                      style={styles.inputActionText}
                    />
                  )}
                </Pressable>
              ) : null
            }
            leftIcon={
              <Svgs.Mail
                width={constants.iconSize}
                height={constants.iconSize}
              />
            }
          />

          {states.otpSent && (
            <>
              <AppInput
                title="OTP"
                gradientBorder
                value={states.otp}
                error={states.otpError}
                keyboardType="number-pad"
                placeholder="Enter the 6-digit OTP"
                maxLength={6}
                onChangeText={handlers.setOtp}
                setError={handlers.setOtpError}
              />
              {states.otpExpired ? (
                <Pressable
                  disabled={states.otpLoading}
                  style={styles.resendOtpButton}
                  onPress={handlers.handleResendOtp}
                >
                  {states.otpLoading ? (
                    <ActivityIndicator size="small" color="#079CDD" />
                  ) : (
                    <AppText
                      semibold
                      label="Resend OTP"
                      style={styles.inputActionText}
                    />
                  )}
                </Pressable>
              ) : (
                <AppText
                  style={styles.otpTimerText}
                  label={`This code will expire in ${states.otpCountdown} minutes.`}
                />
              )}
            </>
          )}

          <AppInput
            title="Full Name"
            gradientBorder
            value={states.fullName}
            error={states.fullNameError}
            autoCapitalize="words"
            placeholder="Your full name"
            onChangeText={handlers.setFullName}
            setError={handlers.setFullNameError}
            leftIcon={
              <Svgs.User
                width={constants.iconSize}
                height={constants.iconSize}
              />
            }
          />

          <AppInput
            title="Username"
            gradientBorder
            value={states.username}
            error={states.usernameError}
            placeholder="Your username"
            onChangeText={handlers.setUsername}
            setError={handlers.setUsernameError}
            leftIcon={
              <Svgs.User
                width={constants.iconSize}
                height={constants.iconSize}
              />
            }
          />

          <AppInput
            gradientBorder
            isContactNumber
            maxLength={10}
            title="Mobile Number"
            value={states.mobileNumber}
            error={states.mobileNumberError}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            placeholder="Enter mobile number"
            onChangeText={handlers.setMobileNumber}
            setError={handlers.setMobileNumberError}
            leftIcon={
              <Svgs.Call
                width={constants.iconSize}
                height={constants.iconSize}
              />
            }
          />

          <AppInput
            isPassword
            gradientBorder
            title="Password"
            value={states.password}
            error={states.passwordError}
            textContentType="newPassword"
            placeholder="Enter your password"
            onChangeText={handlers.setPassword}
            setError={handlers.setPasswordError}
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
            placeholder="Confirm your password"
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
            title="Sign up"
            loader={states.registrationLoading}
            disabled={
              !states.otpSent ||
              !states.otpReady ||
              states.otpLoading ||
              states.registrationLoading
            }
            style={styles.registerButton}
            onPress={handlers.handleRegister}
          />

          <View style={styles.accountRow}>
            <AppText
              style={styles.accountText}
              label="Already have an account? "
            />
            <Pressable onPress={handlers.handleGoToLogin}>
              <AppText
                semibold
                label="Login"
                style={styles.createAccountText}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoider>
    </ImageBackground>
  );
};
