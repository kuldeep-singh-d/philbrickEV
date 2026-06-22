import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const insets = useSafeAreaInsets();
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: moderateWidth(4.8),
      paddingBottom: Math.max(insets.bottom, moderateHeight(1.1)),
    },
    dashboardContainer: {
      backgroundColor: '#C3FFCB',
    },
    tabBar: {
      width: '100%',
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#E3F2E6',
      padding: moderateWidth(1.2),
      backgroundColor: '#FFFFFF',
      minHeight: moderateHeight(7.4),
      borderRadius: moderateWidth(8),

      elevation: 10,
      shadowRadius: 14,
      shadowOpacity: 0.16,
      shadowColor: '#087E8B',
      shadowOffset: { width: 0, height: 5 },
    },
    tabButton: {
      flex: 0.72,
      minWidth: 0,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: moderateHeight(5.4),
      borderRadius: moderateWidth(6),
    },
    activeTabButton: {
      flex: 1.65,
    },
    pressedTabButton: {
      opacity: 0.78,
    },
    tabContent: {
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: moderateWidth(2),
    },
    tabIcon: {
      width: moderateWidth(5.7),
      height: moderateWidth(5.7),
    },
    settingsTabIcon: {
      width: moderateWidth(6.5),
      height: moderateWidth(6.5),
    },
    activeTabLabel: {
      flexShrink: 1,
      color: '#FFFFFF',
      fontSize: moderateHeight(1.5),
      marginLeft: moderateWidth(1.8),
      lineHeight: moderateHeight(1.9),
    },
  });
};

export default useStyles;
