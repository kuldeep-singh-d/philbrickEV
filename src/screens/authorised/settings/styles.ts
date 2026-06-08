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
      marginBottom: moderateHeight(1),
    },
    optionButton: {
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      height: moderateHeight(5.5),
      borderRadius: moderateWidth(3),
    },
    optionGradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    optionText: {
      color: '#FFFFFF',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2.4),
      lineHeight: moderateHeight(3.2),
    },
  });
};

export default useStyles;
