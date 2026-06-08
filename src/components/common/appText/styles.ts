import { Platform, StyleSheet } from 'react-native';

//internal imports
import fonts from '@assets/fonts';
import { useTheme } from '@react-navigation/native';
import { useDeviceDimensions } from '@hooks/useDeviceDimensions';

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    label: {
      color: colors.text,
      // textAlign: 'justify',
      fontFamily: fonts.regular,
      includeFontPadding: false,
      textAlignVertical: 'center',
      fontSize: moderateHeight(1.5),
      paddingVertical: 0,
      lineHeight: Platform.select({
        ios: undefined,
        android: undefined,
      }),
    },
  });
};

export default useStyles;
