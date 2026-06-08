import React from 'react';
import { Svgs } from '@assets/svgs';
import { images } from '@assets/imgaes';
import useRegistration from './useRegistration';
import { ImageBackground, Pressable, View, StatusBar } from 'react-native';
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
              states.emailVerified ? (
                <AppText
                  semibold
                  label="Verified"
                  style={styles.verifiedText}
                />
              ) : states.canVerifyEmail ? (
                <Pressable
                  onPress={handlers.handleSendOtp}
                  style={styles.inputAction}
                >
                  <AppText
                    semibold
                    label="Verify"
                    style={styles.inputActionText}
                  />
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
            <AppInput
              title="OTP"
              gradientBorder
              value={states.otp}
              error={states.otpError}
              keyboardType="number-pad"
              placeholder="Enter OTP"
              maxLength={6}
              onChangeText={handlers.setOtp}
              setError={handlers.setOtpError}
              rightElement={
                <Pressable
                  onPress={handlers.handleVerifyOtp}
                  style={styles.inputAction}
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

          <AppInput
            title="Username"
            gradientBorder
            value={states.name}
            error={states.nameError}
            placeholder="Your username"
            onChangeText={handlers.setName}
            setError={handlers.setNameError}
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
            loader={states.loading}
            disabled={!states.emailVerified || states.loading}
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
