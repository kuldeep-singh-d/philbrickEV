import React, { memo, useCallback, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';

//internal imports
import useStyles from './styles';
import { AppText } from '@components';
import { AppFormInputProps } from './types';
import { useTheme } from '@react-navigation/native';
import { Svgs } from '@assets/svgs';

const AppFormInput = ({
  value,
  setError,
  maxLength,
  title = '',
  error = '',
  placeholder,
  onChangeText,
  keyboardType,
  editable = true,
  onPress,
  isContactNumber = false,
  isPassword = false,
  autoCapitalize = 'none',
}: AppFormInputProps) => {
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
      <Pressable onPress={onPress} style={styles.inputWrapper}>
        <TextInput
          value={value}
          editable={editable}
          maxLength={maxLength}
          placeholder={placeholder}
          cursorColor={colors.text}
          keyboardType={keyboardType}
          selectionColor={colors.primary}
          onChangeText={handleOnchangeText}
          placeholderTextColor={colors.secondary}
          pointerEvents={onPress ? 'none' : 'auto'}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          style={styles.textInput}
        />

        {isPassword && (
          <Pressable onPress={handleEyePress} style={styles.eyeView}>
            {isPasswordVisible ? <Svgs.CloseEye /> : <Svgs.OpenEye />}
          </Pressable>
        )}
      </Pressable>
      <View style={styles.errorContainer}>
        <AppText label={error} style={styles.errorText} />
      </View>
    </View>
  );
};

export default memo(AppFormInput);
