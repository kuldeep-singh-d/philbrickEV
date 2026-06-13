import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const insets = useSafeAreaInsets();
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#EAFBF1',
    },
    content: {
      paddingHorizontal: moderateWidth(4.8),
      paddingTop: insets.top + moderateHeight(1.2),
      paddingBottom: Math.max(insets.bottom, moderateHeight(2.2)),
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconButton: {
      maxWidth: 42,
      maxHeight: 42,
      borderWidth: 1,
      alignItems: 'center',
      borderColor: '#EEEEEE',
      width: moderateWidth(9),
      height: moderateWidth(9),
      justifyContent: 'center',
      borderRadius: moderateWidth(3),
      backgroundColor: 'rgba(255,255,255,0.86)',
    },

    brandLogo: {
      width: moderateWidth(40),
      height: moderateHeight(5),
    },

    heroSpace: {
      height: moderateHeight(16),
    },
    connectionPill: {
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      borderColor: '#EEEEEE',
      // backgroundColor: '#FFFFFF',
      minHeight: moderateHeight(4),
      borderRadius: moderateWidth(3),
      marginBottom: moderateHeight(1.3),
      paddingHorizontal: moderateWidth(3),
    },
    connectionPillDisconnected: {
      backgroundColor: '#FFF7F7',
    },
    connectionDot: {
      width: moderateWidth(3),
      height: moderateWidth(3),
      borderRadius: moderateWidth(1.5),
      marginRight: moderateWidth(2.2),
      backgroundColor: '#31C44C',
    },
    connectionDotDisconnected: {
      backgroundColor: '#ED3237',
    },
    connectionText: {
      color: '#31C44C',
      fontSize: moderateHeight(1.7),
    },
    connectionTextDisconnected: {
      color: '#ED3237',
    },
    card: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#EEEEEE',
      borderRadius: moderateWidth(4),
      backgroundColor: '#FFFFFF',
      marginBottom: moderateHeight(1),
      shadowColor: '#9CA3AF',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    statusCard: {
      minHeight: moderateHeight(8.2),
      paddingHorizontal: moderateWidth(4.2),
      paddingVertical: moderateHeight(1.3),
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusCopy: {
      flex: 1,
      marginLeft: moderateWidth(3.2),
    },
    statusTitle: {
      color: '#31C44C',
      fontSize: moderateHeight(2),
      marginBottom: moderateHeight(0.2),
    },
    statusDescription: {
      color: '#090909',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2),
    },
    metricsCard: {
      minHeight: moderateHeight(9.8),
      paddingHorizontal: moderateWidth(3.5),
      paddingVertical: moderateHeight(1.5),
      flexDirection: 'row',
      alignItems: 'stretch',
      columnGap: moderateWidth(2.2),
    },
    metric: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      paddingHorizontal: moderateWidth(2.4),
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FAFAFA',
    },
    metricLabel: {
      color: '#686868',
      fontSize: moderateHeight(1.45),
      marginBottom: moderateHeight(0.4),
    },
    metricValue: {
      color: '#000000',
      fontSize: moderateHeight(2.05),
      lineHeight: moderateHeight(2.6),
    },
    phaseCard: {
      minHeight: moderateHeight(19.7),
      paddingHorizontal: moderateWidth(3.6),
      paddingVertical: moderateHeight(1.6),
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateHeight(1.2),
    },
    sectionTitle: {
      flex: 1,
      color: '#080808',
      fontSize: moderateHeight(1.85),
      marginLeft: moderateWidth(2.5),
    },
    phaseTable: {
      flex: 1,
      paddingVertical: moderateHeight(0.9),
      borderWidth: 1,
      borderColor: '#DCDCDC',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FAFAFA',
    },
    phaseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateHeight(0.6),
    },
    phaseHeaderText: {
      flex: 1,
      color: '#686868',
      fontSize: moderateHeight(1.7),
      textAlign: 'center',
    },
    phaseRow: {
      flex: 1,
      minHeight: moderateHeight(3),
      flexDirection: 'row',
      alignItems: 'center',
    },
    phaseValue: {
      flex: 1,
      color: '#080808',
      fontSize: moderateHeight(1.65),
      textAlign: 'center',
    },
    sessionCard: {
      minHeight: moderateHeight(9.5),
      paddingHorizontal: moderateWidth(3.5),
      paddingVertical: moderateHeight(1.5),
      flexDirection: 'row',
      alignItems: 'stretch',
      columnGap: moderateWidth(2.8),
    },
    swipeContainer: {
      minHeight: moderateHeight(7.3),
    },
    swipeTrack: {
      flex: 1,
      position: 'relative',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#EEEEEE',
      borderRadius: moderateWidth(4),
      backgroundColor: '#FFFFFF',
    },
    swipeTrackCharging: {
      backgroundColor: '#FFFFFF',
    },
    swipePrompt: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: moderateWidth(15),
      paddingRight: moderateWidth(4),
    },
    swipePromptCharging: {
      paddingLeft: moderateWidth(4),
      paddingRight: moderateWidth(15),
    },
    swipeArrows: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: moderateWidth(2.3),
    },
    swipeArrowsCharging: {
      marginRight: 0,
      marginLeft: moderateWidth(2.3),
    },
    swipeArrowSpacing: {
      marginLeft: moderateWidth(1.3),
    },
    swipeArrowReverse: {
      transform: [{ rotate: '180deg' }],
    },
    swipeLabel: {
      color: '#424656',
      fontSize: moderateHeight(1.85),
      lineHeight: moderateHeight(2.5),
    },
    swipeHandle: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: moderateWidth(16),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: moderateWidth(4),
      backgroundColor: '#10B8A3',
      shadowColor: '#60A5FA',
      shadowOpacity: 0.28,
      shadowRadius: 12,
      shadowOffset: { width: 4, height: 0 },
      elevation: 5,
    },
    swipeHandleCharging: {
      backgroundColor: '#F42F35',
      shadowColor: '#F42F35',
    },
    mqttTestCard: {
      marginTop: moderateHeight(2),
      padding: moderateWidth(4),
      borderWidth: 1,
      borderColor: '#EEEEEE',
      borderRadius: moderateWidth(4),
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 4,
    },
    testTitle: {
      color: '#102348',
      fontSize: moderateHeight(2.2),
      marginBottom: moderateHeight(1.5),
    },
    testRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateHeight(1),
    },
    testLabel: {
      color: '#6B7280',
      fontSize: moderateHeight(1.6),
    },
    testValue: {
      flexShrink: 1,
      marginLeft: moderateWidth(3),
      color: '#111827',
      fontSize: moderateHeight(1.6),
      textAlign: 'right',
    },
    connectionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: moderateWidth(2.2),
      height: moderateWidth(2.2),
      borderRadius: moderateWidth(1.1),
    },
    statusDotConnected: {
      backgroundColor: '#3AC34B',
    },
    statusDotDisconnected: {
      backgroundColor: '#F59E0B',
    },
    receivedBox: {
      marginTop: moderateHeight(0.7),
      padding: moderateWidth(3),
      borderRadius: moderateWidth(2.5),
      backgroundColor: '#F2FBF5',
    },
    receivedTitle: {
      color: '#102348',
      fontSize: moderateHeight(1.7),
      marginBottom: moderateHeight(0.7),
    },
    receivedMeta: {
      color: '#6B7280',
      fontSize: moderateHeight(1.4),
      marginBottom: moderateHeight(0.5),
    },
    receivedMessage: {
      color: '#111827',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2),
    },
    testButton: {
      height: moderateHeight(5.5),
      marginTop: moderateHeight(1.5),
    },
    testFeedback: {
      marginTop: moderateHeight(1),
      color: '#15803D',
      fontSize: moderateHeight(1.4),
      textAlign: 'center',
    },
    testFeedbackError: {
      color: '#DC2626',
    },
  });
};

export default useStyles;
