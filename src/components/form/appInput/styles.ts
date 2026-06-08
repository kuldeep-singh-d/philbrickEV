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
    },
    title: {
      fontSize: moderateWidth(3.5),
    },
    titleRow: {
      flexDirection: 'row',
      marginBottom: moderateHeight(0.5),
    },

    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.secondary,
      backgroundColor: colors.white,
      borderWidth: moderateWidth(0.5),
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(4),
    },
    gradientBorder: {
      overflow: 'hidden',
      borderRadius: moderateWidth(2.7),
    },
    gradientInput: {
      borderWidth: 0,
      margin: moderateWidth(0.45),
      borderRadius: moderateWidth(2.25),
    },
    leftIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateWidth(3),
    },
    textInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 0,
      includeFontPadding: false,
      fontFamily: fonts.regular,
      height: moderateHeight(5),
      textAlignVertical: 'center',
      fontSize: moderateHeight(1.7),
    },

    errorText: {
      color: 'red',
      textAlign: 'right',
      fontSize: moderateHeight(1.4),
      marginBottom: moderateHeight(1),
      marginRight: moderateHeight(0.5),
    },
    eyeView: {
      marginTop: moderateWidth(0.5),
    },
    errorContainer: {
      justifyContent: 'flex-end',
      marginTop: moderateHeight(0.5),
    },
    gradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });
};

export default useStyles;
