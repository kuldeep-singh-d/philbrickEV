import { AppStatusBarProps } from './types';
import React, { memo, useMemo } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AppStatusBar = ({
  absolute,
  barStyle,
  translucent = false,
  backgroundColor = '#FFFFFF',
  ...props
}: AppStatusBarProps) => {
  const insets = useSafeAreaInsets();

  const height = useMemo(() => {
    return absolute
      ? 0
      : Platform.OS === 'ios'
      ? insets.top
      : StatusBar.currentHeight;
  }, [absolute, insets.top]);

  const containerStyle = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: translucent ? 0 : height,
          backgroundColor,
        },
      }).container,
    [backgroundColor, height, translucent],
  );

  return (
    <View style={containerStyle}>
      <StatusBar
        {...props}
        translucent
        barStyle={barStyle}
        backgroundColor={backgroundColor}
      />
    </View>
  );
};

export default memo(AppStatusBar);
