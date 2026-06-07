import { View, TextInput, Pressable } from 'react-native';
import React, { memo, useCallback, useState } from 'react';

//internal imports
import useStyles from './styles';
import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import { AppInputProps } from './types';
import { useTheme } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const GRADIENT_END = '#3AC34B';
const GRADIENT_START = '#0BB2C3';

const AppInput = ({
  value,
  onPress,
  setError,
  leftIcon,
  rightElement,
  maxLength,
  title = '',
  error = '',
  placeholder,
  onChangeText,
  keyboardType,
  autoComplete,
  returnKeyType,
  editable = true,
  onSubmitEditing,
  textContentType,
  isPassword = false,
  gradientBorder = false,
  isContactNumber = false,
  autoCapitalize = 'none',
}: AppInputProps) => {
  const styles = useStyles();
  const { colors } = useTheme();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleOnchangeText = useCallback(
    (text: string): void => {
      const regext = /^\s*\d*\s*$/;
      if (isContactNumber) {
        if (regext.test(text)) {
          onChangeText && onChangeText(text);
        }
      } else {
        onChangeText && onChangeText(text);
      }
      setError && setError('');
    },
    [isContactNumber, onChangeText, setError],
  );

  const handleEyePress = useCallback(() => {
    setIsPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  const input = (
    <Pressable
      onPress={onPress}
      style={[styles.inputWrapper, gradientBorder && styles.gradientInput]}
    >
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

      <TextInput
        value={value}
        editable={editable}
        maxLength={maxLength}
        style={styles.textInput}
        placeholder={placeholder}
        cursorColor={colors.text}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        returnKeyType={returnKeyType}
        selectionColor={colors.primary}
        autoCapitalize={autoCapitalize}
        onChangeText={handleOnchangeText}
        onSubmitEditing={onSubmitEditing}
        textContentType={textContentType}
        placeholderTextColor={colors.gray}
        pointerEvents={onPress ? 'none' : 'auto'}
        secureTextEntry={isPassword && !isPasswordVisible}
      />

      {rightElement ? rightElement : null}

      {isPassword && (
        <Pressable onPress={handleEyePress} style={styles.eyeView} hitSlop={10}>
          {isPasswordVisible ? <Svgs.OpenEye /> : <Svgs.CloseEye />}
        </Pressable>
      )}
    </Pressable>
  );

  return (
    <View style={styles.wrapper}>
      {title && (
        <View style={styles.titleRow}>
          <AppText
            medium
            label={title}
            style={styles.title}
            color={String(colors.text)}
          />
        </View>
      )}
      {gradientBorder ? (
        <View style={styles.gradientBorder}>
          <Svg
            width="100%"
            height="100%"
            pointerEvents="none"
            style={styles.gradient}
          >
            <Defs>
              <LinearGradient id="inputGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={GRADIENT_START} />
                <Stop offset="1" stopColor={GRADIENT_END} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#inputGradient)" />
          </Svg>
          {input}
        </View>
      ) : (
        input
      )}
      <View style={styles.errorContainer}>
        <AppText label={error} style={styles.errorText} />
      </View>
    </View>
  );
};

export default memo(AppInput);
