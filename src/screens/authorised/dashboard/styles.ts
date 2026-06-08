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
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: moderateWidth(4),
      marginTop: insets.top + moderateHeight(0),
    },
    iconButton: {
      width: moderateWidth(11),
      height: moderateWidth(11),
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandLogo: {
      width: moderateWidth(46),
      height: moderateHeight(7.5),
    },
    cardContainer: {
      flex: 1,
      marginTop: moderateHeight(2.5),
      marginHorizontal: moderateWidth(4),
      paddingBottom: moderateHeight(2),
    },
    controlCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: moderateWidth(4),
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(1),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateHeight(1.2),
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    statusCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: moderateWidth(4),
      padding: moderateWidth(4),
      marginBottom: moderateHeight(1.5),
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    controlLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapperActive: {
      alignItems: 'center',
      width: moderateWidth(12),
      justifyContent: 'center',
      height: moderateWidth(12),
      marginRight: moderateWidth(3),
      borderRadius: moderateWidth(3),
    },
    controlLabel: {
      color: '#3AC34B',
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(2.5),
    },
    modeAction: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modeArrow: {
      fontSize: moderateHeight(3),
      color: '#111827',
      marginHorizontal: moderateWidth(2),
    },
    modeValue: {
      fontSize: moderateHeight(2.5),
      color: '#111827',
    },
    statusTextGroup: {
      flex: 1,
    },
    statusLabel: {
      color: '#3AC34B',
      fontSize: moderateHeight(2.1),
      marginBottom: moderateHeight(0.4),
    },
    statusDescription: {
      fontSize: moderateHeight(1.6),
      color: '#111827',
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: moderateHeight(2),
    },
    metricCard: {
      width: '48%',
      minHeight: moderateHeight(16),
      borderRadius: moderateWidth(5),
      backgroundColor: '#EEFDF5',
      padding: moderateWidth(4),
      marginBottom: moderateHeight(1.5),
      justifyContent: 'space-between',
    },
    metricTitle: {
      fontSize: moderateHeight(1.4),
      color: '#111827',
      marginBottom: moderateHeight(0.5),
    },
    metricValue: {
      fontSize: moderateHeight(3.1),
      color: '#111827',
    },
    metricSubtitle: {
      fontSize: moderateHeight(1.5),
      color: '#4B5563',
      marginTop: moderateHeight(0.5),
    },
    swipeContainer: {
      marginTop: moderateHeight(1.5),
      paddingBottom: moderateHeight(1),
    },
    swipeTrack: {
      position: 'relative',
      justifyContent: 'center',
      minHeight: moderateHeight(8),
      borderRadius: moderateWidth(6),
      paddingVertical: moderateHeight(1),
      paddingHorizontal: moderateWidth(4),
    },
    swipeTrackInactive: {
      backgroundColor: '#E6F9EC',
    },
    swipeTrackActive: {
      backgroundColor: '#FCE7E9',
    },
    swipeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    swipeIconBox: {
      alignItems: 'center',
      width: moderateWidth(12),
      justifyContent: 'center',
      height: moderateWidth(12),
      backgroundColor: '#10B981',
      marginRight: moderateWidth(3),
      borderRadius: moderateWidth(4),
    },
    swipeTextRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    swipeLabel: {
      fontSize: moderateHeight(2.1),
      color: '#111827',
      flexShrink: 1,
    },
    swipeArrows: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: moderateWidth(4),
    },
    swipeArrowMargin: {
      marginLeft: moderateWidth(2),
    },
    swipeHandle: {
      position: 'absolute',
      width: moderateWidth(16),
      height: moderateHeight(7),
      borderRadius: moderateWidth(4),
      alignItems: 'center',
      justifyContent: 'center',
      top: moderateHeight(0.5),
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    swipeHandleInactive: {
      backgroundColor: '#10B981',
    },
    swipeHandleActive: {
      backgroundColor: '#EF4444',
    },
  });
};

export default useStyles;
