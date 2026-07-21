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
      marginBottom: moderateHeight(1),
    },
    description: {
      color: '#6B7280',
      fontSize: moderateHeight(1.7),
      lineHeight: moderateHeight(2.5),
    },
    loader: {
      marginVertical: moderateHeight(4),
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateHeight(4),
    },
    deviceCard: {
      width: '100%',
      borderWidth: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF',
      borderRadius: moderateWidth(3),
      minHeight: moderateHeight(8.2),
      marginBottom: moderateHeight(1),
      paddingVertical: moderateHeight(1),
      paddingHorizontal: moderateWidth(4),
    },
    selectedDeviceCard: {
      borderColor: '#3AC34B',
      backgroundColor: '#F6FFF7',
    },
    pressedDeviceCard: {
      opacity: 0.8,
    },
    deviceInfo: {
      flex: 1,
    },
    deviceCardRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateWidth(2),
      marginLeft: moderateWidth(2),
    },
    activeBadge: {
      marginLeft: moderateWidth(3),
      paddingVertical: moderateHeight(0.45),
      paddingHorizontal: moderateWidth(2.8),
      borderRadius: moderateWidth(4),
      backgroundColor: '#31C44C',
    },
    activeBadgeText: {
      color: '#FFFFFF',
      fontSize: moderateHeight(1.25),
      lineHeight: moderateHeight(1.8),
    },
    deleteButton: {
      width: moderateHeight(3.5),
      height: moderateHeight(3.5),
      borderRadius: moderateWidth(2),
      backgroundColor: '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonPressed: {
      opacity: 0.6,
      backgroundColor: '#FECACA',
    },
    deviceName: {
      fontSize: moderateHeight(1.8),
      marginBottom: moderateHeight(0.25),
    },
    deviceDetail: {
      color: '#6B7280',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
    actionsContainer: {
      marginTop: 'auto',
      marginBottom: moderateHeight(2),
    },
    refreshPill: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateHeight(1.2),
      paddingVertical: moderateHeight(0.7),
      paddingHorizontal: moderateWidth(5),
      borderRadius: moderateWidth(4),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#F3F4F6',
    },
    refreshPillPressed: {
      opacity: 0.75,
    },
    refreshPillDisabled: {
      opacity: 0.6,
    },
    refreshPillIcon: {
      width: moderateWidth(4),
      height: moderateWidth(4),
      marginRight: moderateWidth(1.2),
    },
    refreshPillText: {
      color: '#6B7280',
      fontSize: moderateHeight(1.4),
      lineHeight: moderateHeight(1.8),
    },
  });
};

export default useStyles;
