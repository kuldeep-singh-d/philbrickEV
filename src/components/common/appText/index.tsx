import React, { memo } from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

//internal imports
import useStyles from './styles';
import fonts from '@assets/fonts';
import { useTheme } from '@react-navigation/native';

interface AppTextProps extends TextProps {
  color?: any;
  bold?: boolean;
  medium?: boolean;
  semibold?: boolean;
  centered?: boolean;
  label: string | any;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

const AppText = ({
  bold,
  label,
  style,
  color,
  medium,
  semibold,
  centered,
  numberOfLines,
  ...rest
}: AppTextProps) => {
  const styles = useStyles();
  const { colors } = useTheme();

  const textStyle: StyleProp<TextStyle> = [
    styles.label,
    bold && { fontFamily: fonts.bold },
    medium && { fontFamily: fonts.medium },
    semibold && { fontFamily: fonts.semibold },

    centered && { textAlign: 'center' },
    color ? { color } : { color: colors.text },
    style,
  ];

  return (
    <Text numberOfLines={numberOfLines ?? 1} style={textStyle} {...rest}>
      {label ?? '-'}
    </Text>
  );
};

export default memo(AppText);
