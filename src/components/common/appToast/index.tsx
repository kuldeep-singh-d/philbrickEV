import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import { AppText } from '@components';
import Toast from 'react-native-toast-message';
import { useDeviceDimensions } from '@hooks/index';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MessageProps = { text1?: string; props?: any };

const ToastMessage = () => {
  const { moderateHeight } = useDeviceDimensions();
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();
  const styles = useStyles(colors);
  const toastConfig = useMemo(
    () => createToastConfig(styles, colors.text),
    [colors.text, styles],
  );

  return (
    <Toast
      config={toastConfig}
      topOffset={Platform.OS === 'ios' ? insets.top : moderateHeight(0.5)}
    />
  );
};

export default memo(ToastMessage);

const useStyles = (colors: any) => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();
  return StyleSheet.create({
    wrapperSuccess: {
      width: moderateWidth(90),
      marginTop: moderateHeight(5),
      borderRadius: moderateHeight(1),
      paddingVertical: moderateWidth(3),
      backgroundColor: colors.toastSuccess,
    },
    wrapperError: {
      width: moderateWidth(90),
      marginTop: moderateHeight(5),
      borderRadius: moderateHeight(1),
      paddingVertical: moderateWidth(3),
      backgroundColor: colors.toastError,
    },
    wrapperWarn: {
      width: moderateWidth(90),
      marginTop: moderateHeight(5),
      borderRadius: moderateHeight(1),
      backgroundColor: colors.toastWarn,
      paddingVertical: moderateWidth(3),
    },
    message: {
      color: colors.text,
      padding: moderateHeight(1.7),
      fontSize: moderateHeight(1.7),
    },
  });
};

const createToastConfig = (
  styles: ReturnType<typeof useStyles>,
  textColor: string,
) => ({
  success: ({ text1 }: MessageProps) => (
    <View style={styles.wrapperSuccess}>
      <AppText
        semibold
        label={text1}
        numberOfLines={3}
        style={styles.message}
      />
    </View>
  ),
  error: ({ text1 }: MessageProps) => (
    <View style={styles.wrapperError}>
      <AppText
        semibold
        label={text1}
        numberOfLines={3}
        style={styles.message}
      />
    </View>
  ),
  warn: ({ text1 }: MessageProps) => (
    <View style={styles.wrapperWarn}>
      <AppText
        semibold
        label={text1}
        numberOfLines={3}
        color={textColor}
        style={styles.message}
      />
    </View>
  ),
});
