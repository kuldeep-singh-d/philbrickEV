import { StyleSheet } from 'react-native';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: moderateHeight(2),
      paddingBottom: moderateHeight(13),
    },
    heading: {
      color: '#111827',
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(3.2),
      marginBottom: moderateHeight(1.2),
    },
    addButton: {
      borderRadius: moderateWidth(2.6),
      overflow: 'hidden',
    },
    inputWrapper: {
      borderColor: '#E5E7EB',
      borderWidth: moderateWidth(0.4),
      borderRadius: moderateWidth(2.5),
    },
  });
};

export default useStyles;
