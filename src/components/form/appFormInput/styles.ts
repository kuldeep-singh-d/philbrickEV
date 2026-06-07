import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDeviceDimensions } from '@hooks/useDeviceDimensions';

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    wrapper: {
      width: '100%',
      justifyContent: 'center',
      //   marginTop: moderateHeight(1),
    },
    title: {
      fontSize: moderateWidth(3.5),
      marginBottom: moderateHeight(0.3),
    },
    titleRow: {
      flexDirection: 'row',
    },

    inputWrapper: {
      flex: 1,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.border,
      height: moderateHeight(5),
      backgroundColor: colors.white,
      borderWidth: moderateWidth(0.5),
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(4),
    },
    textInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 0,
      includeFontPadding: false,
      fontFamily: fonts.regular,
      fontSize: moderateHeight(1.8),
      height: moderateHeight(5.5),
      textAlignVertical: 'center',
    },
    prefix: {
      color: colors.text,
      fontFamily: fonts.regular,
      height: moderateHeight(6),
      fontSize: moderateHeight(2),
      paddingTop: moderateHeight(1),
    },

    errorText: {
      color: 'red',
      textAlign: 'right',
      fontSize: moderateHeight(1.7),
      marginRight: moderateHeight(0.5),
      marginBottom: moderateHeight(1),
    },
    barcodeView: {
      //   marginTop: moderateWidth(0.5),
    },
    eyeView: {
      marginTop: moderateWidth(0.5),
    },
    errorContainer: {
      justifyContent: 'flex-end',
    },
  });
};

export default useStyles;
