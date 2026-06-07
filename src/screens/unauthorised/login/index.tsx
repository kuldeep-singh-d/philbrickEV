import React from 'react';
import { Svgs } from '@assets/svgs';
import { useLogin } from './useLogin';
import { images } from '@assets/imgaes';
import { ImageBackground, Pressable, View, StatusBar } from 'react-native';
import { AppButton, AppInput, AppText, KeyboardAvoider } from '@components';

export const Login = () => {
  const { styles, states, handlers, constants } = useLogin();

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
            label="Power Is Just One Login Away."
          />

          <AppInput
            title="Email"
            gradientBorder
            value={states.email}
            returnKeyType="next"
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

          <AppInput
            isPassword
            gradientBorder
            title="Password"
            returnKeyType="done"
            value={states.password}
            textContentType="password"
            error={states.passwordError}
            autoComplete="current-password"
            placeholder="Enter your password"
            onChangeText={handlers.setPassword}
            setError={handlers.setPasswordError}
            onSubmitEditing={handlers.handleLogin}
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
            disabled={states.loading}
            style={styles.loginButton}
            onPress={handlers.handleLogin}
          />

          <Pressable
            style={styles.forgotButton}
            onPress={handlers.handleForgotPassword}
          >
            <AppText
              centered
              style={styles.forgotText}
              label="Forgot your password?"
            />
          </Pressable>

          <View style={styles.accountRow}>
            <AppText
              style={styles.accountText}
              label="Don't have an account? "
            />
            <Pressable onPress={handlers.handleCreateAccount}>
              <AppText
                semibold
                label="Create an Account"
                style={styles.createAccountText}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoider>
    </ImageBackground>
  );
};
