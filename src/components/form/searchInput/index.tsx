import React, { memo, useCallback } from 'react';
import { View, TextInput, TextInputProps, Pressable } from 'react-native';

import useStyles from './styles';
import { Svgs } from '@assets/svgs';
import { useTheme } from '@react-navigation/native';

interface AuthInputProps extends TextInputProps {
  filter?: boolean;
  onPress?(): void;
  redeemNow?: boolean;
  onEnterKey?(): void;
  handleFilter?(): void;
  handleClearInput?(): void;
}

const SearchInput = ({
  value,
  onEnterKey,
  onChangeText,
  handleClearInput,
  placeholder = '',
}: AuthInputProps) => {
  const styles = useStyles();
  const { colors } = useTheme();

  const handleOnchangeText = useCallback(
    (text: string): void => {
      onChangeText && onChangeText(text);
    },
    [onChangeText],
  );

  const handleOnSubmitEditing = () => {
    onEnterKey && onEnterKey();
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <TextInput
          value={value}
          style={styles.input}
          returnKeyType="search"
          placeholder={placeholder}
          cursorColor={colors.text}
          selectionColor={colors.primary}
          onChangeText={handleOnchangeText}
          placeholderTextColor={colors.gray}
          onSubmitEditing={handleOnSubmitEditing}
        />
        {value ? (
          <Pressable onPress={handleClearInput}>
            <Svgs.Cross />
          </Pressable>
        ) : (
          <Svgs.Search />
        )}
      </View>
    </View>
  );
};

export default memo(SearchInput);
