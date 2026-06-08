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
      marginBottom: moderateHeight(1.3),
    },
    addButton: {
      height: moderateHeight(7),
      borderRadius: moderateWidth(3),
      marginTop: moderateHeight(2),
    },
  });
};

export default useStyles;
