import { StyleSheet } from 'react-native';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: moderateHeight(2.6),
    },
    heading: {
      color: '#111827',
      fontSize: moderateHeight(2.2),
      lineHeight: moderateHeight(3),
      marginBottom: moderateHeight(1.4),
    },
    emptyState: {
      minHeight: moderateHeight(24),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#D8F5DD',
      borderRadius: moderateWidth(4),
      backgroundColor: '#F6FFF7',
      paddingHorizontal: moderateWidth(6),
      shadowColor: '#6B8F72',
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    emptyIconContainer: {
      width: moderateWidth(15),
      height: moderateWidth(15),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#CBEFD2',
      borderRadius: moderateWidth(7.5),
      backgroundColor: '#EAFBF1',
      marginBottom: moderateHeight(1.4),
    },
    emptyIcon: {
      width: moderateWidth(7),
      height: moderateWidth(7),
    },
    emptyTitle: {
      color: '#1F2937',
      fontSize: moderateHeight(1.9),
      lineHeight: moderateHeight(2.6),
      marginBottom: moderateHeight(0.5),
    },
    emptyDescription: {
      color: '#6B7280',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
  });
};

export default useStyles;
