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
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: moderateWidth(3),
      paddingVertical: moderateHeight(1.5),
      paddingHorizontal: moderateWidth(4),
      marginBottom: moderateHeight(1.5),
      backgroundColor: '#FFFFFF',
    },
    selectedDeviceCard: {
      borderColor: '#3AC34B',
    },
    pressedDeviceCard: {
      opacity: 0.8,
    },
    deviceInfo: {
      flex: 1,
    },
    selectedDot: {
      marginLeft: moderateWidth(3),
    },
    deviceName: {
      fontSize: moderateHeight(1.8),
      marginBottom: moderateHeight(0.5),
    },
    deviceDetail: {
      color: '#6B7280',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
    actionsContainer: {
      marginTop: 'auto',
      marginBottom: moderateHeight(4),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfButton: {
      width: '48%',
    },
  });
};

export default useStyles;
