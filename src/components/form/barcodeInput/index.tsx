import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';

//internal imports
import useStyles from './styles';
import { Svgs } from '@assets/svgs';
import { AppText } from '@components';
import { AppInputProps } from './types';
import { useTheme } from '@react-navigation/native';

const BarcodeInput = ({
  value,
  title,
  maxLength,
  error = '',
  keyboardType,
  placeholder,
  editable = true,
  isNumber = false,
  autoCapitalize = 'none',

  setError,
  onChangeText,
  handleScanBarcode,
  onAdd,
  keyboardVisible,
  onBlur,
  isLoading = false,
  focusSignal,
  qty,
  onSubmitEditing,
  blurOnSubmit,
}: AppInputProps) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const isPencilFocusRef = useRef(false);
  const isInputFocusedRef = useRef(false);
  const textInputRef = useRef<TextInput>(null);
  const [, setIsInputFocused] = useState(false);
  const [showKeyboardOnFocus, setShowKeyboardOnFocus] = useState(false);

  const handleOnchangeText = useCallback(
    (text: string): void => {
      const regext = /^\s*\d*\s*$/;
      if (isNumber) {
        if (regext.test(text)) {
          onChangeText && onChangeText(text);
        }
      } else {
        onChangeText && onChangeText(text);
      }
      setError && setError('');
    },
    [onChangeText, setError, isNumber],
  );

  const handleInputFocus = useCallback(() => {
    isInputFocusedRef.current = true;
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    isInputFocusedRef.current = false;
    if (isPencilFocusRef.current) {
      return;
    }

    setIsInputFocused(false);
    setShowKeyboardOnFocus(false);
    textInputRef.current?.setNativeProps({ showSoftInputOnFocus: false });
    // Call the original onBlur handler
    onBlur && onBlur();
  }, [onBlur]);

  const handlePress = useCallback(() => {
    setShowKeyboardOnFocus(false);
    textInputRef.current?.setNativeProps({ showSoftInputOnFocus: false });
    textInputRef.current?.focus();
  }, []);

  const handlePencilPress = useCallback(() => {
    isPencilFocusRef.current = true;
    setShowKeyboardOnFocus(true);
    textInputRef.current?.setNativeProps({ showSoftInputOnFocus: true });

    if (isInputFocusedRef.current) {
      textInputRef.current?.blur();
    }
    setTimeout(() => {
      textInputRef.current?.focus();
      isPencilFocusRef.current = false;
    }, 0);
  }, []);

  const handleBarcodePress = useCallback(() => {
    handleScanBarcode && handleScanBarcode();
  }, [handleScanBarcode]);

  useEffect(() => {
    if (!focusSignal || !editable) {
      return;
    }

    setShowKeyboardOnFocus(false);
    textInputRef.current?.setNativeProps({ showSoftInputOnFocus: false });

    const timeout = setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, [editable, focusSignal]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <AppText
          medium
          style={styles.title}
          color={String(colors.text)}
          label={title ? title : 'Barcode'}
        />
        {Boolean(qty) && (
          <AppText
            semibold
            label={`Total Qty: ${qty}`}
            style={styles.title}
            color={String(colors.primary)}
          />
        )}
      </View>

      <Pressable onPress={handlePress} style={[styles.inputWrapper]}>
        <TextInput
          value={value}
          ref={textInputRef}
          editable={editable}
          maxLength={maxLength}
          onBlur={handleInputBlur}
          cursorColor={colors.text}
          onFocus={handleInputFocus}
          keyboardType={keyboardType}
          blurOnSubmit={blurOnSubmit}
          selectionColor={colors.primary}
          autoCapitalize={autoCapitalize}
          onChangeText={handleOnchangeText}
          onSubmitEditing={onSubmitEditing}
          showSoftInputOnFocus={showKeyboardOnFocus}
          placeholder={placeholder || 'Enter Barcode'}
          placeholderTextColor={colors.gray as string}
          style={styles.textInput}
        />

        <Pressable
          onPress={handlePencilPress}
          style={styles.barcodeView}
          hitSlop={{ top: 18, bottom: 18, left: 10, right: 10 }}
        >
          <Svgs.Pencil height={15} width={15} style={styles.barcodeIcon} />
        </Pressable>

        <Pressable
          onPress={
            showKeyboardOnFocus || keyboardVisible
              ? onAdd ?? handleBarcodePress
              : handleBarcodePress
          }
          style={styles.barcodeView}
          hitSlop={{ top: 18, bottom: 18, right: 10 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : onAdd && (keyboardVisible || showKeyboardOnFocus) ? (
            <AppText
              semibold
              label={`Add`}
              style={styles.addLabel}
              color={colors.primary}
            />
          ) : (
            <Svgs.Barcode height={20} width={20} style={styles.barcodeIcon} />
          )}
        </Pressable>
      </Pressable>
      {error ? (
        <View style={styles.errorContainer}>
          <AppText label={error} style={styles.errorText} />
        </View>
      ) : null}
    </View>
  );
};

export default memo(BarcodeInput);
