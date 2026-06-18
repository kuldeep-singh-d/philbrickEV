import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';
import fonts from '@assets/fonts';

export default () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingHorizontal: moderateWidth(6),
      paddingTop: moderateHeight(3.6),
    },
    heading: {
      color: '#000000',
      fontSize: moderateHeight(2.5),
      lineHeight: moderateHeight(3.4),
      marginBottom: moderateHeight(2.8),
    },
    alertList: {
      width: '100%',
    },
    alertCard: {
      width: '100%',
      minHeight: moderateHeight(6.2),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFB3B7',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FFC9CC',
      marginBottom: moderateHeight(1.2),
      paddingHorizontal: moderateWidth(3),
      paddingVertical: moderateHeight(0.7),
    },
    alertIcon: {
      width: moderateWidth(10),
      height: moderateHeight(4.4),
    },
    alertTitle: {
      flex: 1,
      color: '#FF363C',
      fontFamily: fonts.regular,
      fontSize: moderateHeight(2),
      marginLeft: moderateWidth(3),
    },
    emptyState: {
      minHeight: moderateHeight(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FFFFFF',
      paddingHorizontal: moderateWidth(4),
    },
    emptyText: {
      color: '#6B7280',
      fontSize: moderateHeight(1.8),
      lineHeight: moderateHeight(2.5),
    },
  });
};
