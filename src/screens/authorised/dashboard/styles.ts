import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const insets = useSafeAreaInsets();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: moderateHeight(2.6),
    },
    heading: {
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(3.2),
      marginBottom: moderateHeight(1),
    },
    brandHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: moderateHeight(0.5),
      paddingTop: insets.top + moderateHeight(-1),
    },
    brandLogo: {
      width: moderateWidth(46),
      height: moderateHeight(7.5),
    },
  });
};

export default useStyles;
