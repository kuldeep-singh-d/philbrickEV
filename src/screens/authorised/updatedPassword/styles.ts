import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: moderateHeight(2.6),
    },
    heading: {
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(3.2),
      marginBottom: moderateHeight(2),
    },
    inputTitle: {
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2.25),
    },
    inputSpacer: {
      marginBottom: moderateHeight(0.8),
    },
    updateButton: {
      height: moderateHeight(7),
      borderRadius: moderateWidth(3),
      marginTop: moderateHeight(1.4),
    },
    inputAction: {
      paddingLeft: moderateWidth(3),
      paddingVertical: moderateHeight(1),
    },
    inputActionText: {
      color: '#0BB2C3',
      fontSize: moderateHeight(1.5),
    },
    forgotButton: {
      alignSelf: 'center',
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(2.4),
    },
    forgotText: {
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.7),
    },
  });
};

export default useStyles;
