import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';

export default () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingHorizontal: moderateWidth(6),
    },
    heading: {
      fontSize: moderateHeight(2),
      marginBottom: moderateHeight(1),
    },
    message: {
      marginTop: moderateHeight(1),
      //   lineHeight: moderateHeight(3),
      color: '#4A4A4A',
    },
  });
};
