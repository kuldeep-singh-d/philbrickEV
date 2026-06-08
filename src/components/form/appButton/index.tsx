import React, { memo } from 'react';
import {
  View,
  ViewStyle,
  Pressable,
  ColorValue,
  ActivityIndicator,
} from 'react-native';

import useStyles from './styles';
import { AppText } from '@components';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { useDeviceDimensions } from '@hooks/useDeviceDimensions';

const GRADIENT_START = '#0BB2C3';
const GRADIENT_END = '#3AC34B';

interface ButtonProps {
  title: string;
  size?: number;
  onPress?(): void;
  loader?: boolean;
  border?: boolean;
  topMargin?: number;
  color?: ColorValue;
  isBottom?: boolean;
  isBackground?: boolean;
  disabled?: boolean;
  style?: ViewStyle | any;
}

const AppButton = ({
  style,
  onPress,
  isBottom,
  title = '',
  loader = false,
  topMargin,
  disabled = false,
}: ButtonProps) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const { moderateHeight } = useDeviceDimensions();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loader}
      style={[
        styles.containerBG,
        disabled && styles.disabled,
        style,
        {
          marginTop: topMargin
            ? moderateHeight(topMargin)
            : moderateHeight(1.5),
        },
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        pointerEvents="none"
        style={styles.gradient}
      >
        <Defs>
          <LinearGradient id="buttonGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={GRADIENT_START} />
            <Stop offset="1" stopColor={GRADIENT_END} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#buttonGradient)" />
      </Svg>

      <View style={[styles.wrapper, isBottom && styles.bottom]}>
        {loader ? (
          <ActivityIndicator size="large" color={colors.white} />
        ) : (
          <AppText semibold label={title} style={styles.label} />
        )}
      </View>
    </Pressable>
  );
};

export default memo(AppButton);
