import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';
import fonts from '@assets/fonts';

export default () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: moderateHeight(1.5),
    },
    headingRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateHeight(1),
    },
    heading: {
      flex: 1,
      color: '#111827',
      fontSize: moderateHeight(2.2),
      lineHeight: moderateHeight(3),
    },
    alertList: {
      width: '100%',
    },
    alertCard: {
      width: '100%',
      minHeight: moderateHeight(7.4),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F3D1D3',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FFFFFF',
      marginBottom: moderateHeight(1),
      paddingHorizontal: moderateWidth(3),
      paddingVertical: moderateHeight(0.9),
      shadowColor: '#7F1D1D',
      shadowOpacity: 0.07,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    alertAccent: {
      width: moderateWidth(0.8),
      height: moderateHeight(4.4),
      borderRadius: moderateWidth(1),
      backgroundColor: '#ED3237',
      marginRight: moderateWidth(2.4),
    },
    iconContainer: {
      width: moderateWidth(9.5),
      height: moderateWidth(9.5),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#FECACA',
      borderRadius: moderateWidth(2.8),
      backgroundColor: '#FFF1F2',
    },
    alertIcon: {
      width: moderateWidth(5.4),
      height: moderateWidth(5.4),
    },
    alertContent: {
      flex: 1,
      marginLeft: moderateWidth(3),
      marginRight: moderateWidth(1),
    },
    alertTitle: {
      color: '#1F2937',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(1.7),
      lineHeight: moderateHeight(2.3),
      marginBottom: moderateHeight(0.2),
    },
    categoryText: {
      color: '#8A4A4D',
      fontSize: moderateHeight(1.25),
      lineHeight: moderateHeight(1.8),
    },
    emptyState: {
      minHeight: moderateHeight(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#D8F5DD',
      borderRadius: moderateWidth(3),
      backgroundColor: '#F6FFF7',
      paddingHorizontal: moderateWidth(4),
    },
    emptyIconContainer: {
      width: moderateWidth(12),
      height: moderateWidth(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateWidth(6),
      backgroundColor: '#31C44C',
      marginBottom: moderateHeight(1.2),
    },
    emptyIcon: {
      width: moderateWidth(5),
      height: moderateWidth(3.8),
    },
    emptyTitle: {
      color: '#1F2937',
      fontSize: moderateHeight(1.9),
      lineHeight: moderateHeight(2.6),
      marginBottom: moderateHeight(0.4),
    },
    emptyText: {
      color: '#6B7280',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
  });
};
