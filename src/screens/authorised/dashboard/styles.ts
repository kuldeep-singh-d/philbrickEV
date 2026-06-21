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
    hiddenIconButton: {
      opacity: 0,
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
      paddingHorizontal: moderateWidth(3.5),
      paddingVertical: moderateHeight(1.5),
    },
    metricsGrid: {
      minHeight: moderateHeight(6.8),
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
    metricUnit: {
      fontSize: moderateHeight(1.45),
    },
    phaseToggle: {
      borderTopWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopColor: '#EEEEEE',
      marginTop: moderateHeight(1.2),
      justifyContent: 'space-between',
      paddingTop: moderateHeight(1.1),
      paddingHorizontal: moderateWidth(1),
    },
    phaseToggleLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionTitle: {
      color: '#080808',
      fontSize: moderateHeight(1.6),
      marginLeft: moderateWidth(2.2),
    },
    phaseToggleIconExpanded: {
      transform: [{ rotate: '180deg' }],
    },
    expandedPhaseSection: {
      rowGap: moderateHeight(1),
      paddingTop: moderateHeight(0.8),
    },
    phaseMetricCard: {
      borderRadius: moderateWidth(3),
    },
    phaseBadge: {
      maxWidth: 38,
      maxHeight: 38,
      alignItems: 'center',
      width: moderateWidth(8),
      height: moderateWidth(8),
      justifyContent: 'center',
      backgroundColor: '#EAFBF1',
      borderRadius: moderateWidth(2.3),
    },
    phaseBadgeText: {
      color: '#31C44C',
      fontSize: moderateHeight(1.8),
    },
    phaseCardTitle: {
      flex: 1,
      color: '#080808',
      fontSize: moderateHeight(1.85),
      marginLeft: moderateWidth(0.5),
    },
    phaseMetricGrid: {
      flexDirection: 'row',
      columnGap: moderateWidth(2.2),
    },
    phaseMiniMetric: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#DDDDDD',
      justifyContent: 'center',
      backgroundColor: '#FAFAFA',
      minHeight: moderateHeight(5.2),
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(3),
    },
    phaseMiniLabel: {
      color: '#686868',
      fontSize: moderateHeight(1.45),
      marginBottom: moderateHeight(0.3),
    },
    phaseMiniValue: {
      color: '#000000',
      fontSize: moderateHeight(1.95),
      lineHeight: moderateHeight(2.5),
    },
    phaseMiniUnit: {
      fontSize: moderateHeight(1.35),
    },
    sessionCard: {
      flexDirection: 'row',
      alignItems: 'stretch',
      columnGap: moderateWidth(2.8),
      minHeight: moderateHeight(9.5),
      paddingVertical: moderateHeight(1.5),
      paddingHorizontal: moderateWidth(3.5),
    },
    currentControl: {
      paddingVertical: moderateHeight(0.8),
    },
    currentControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    currentArrowButton: {
      width: moderateWidth(8),
      height: moderateWidth(8),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateWidth(2),
      // backgroundColor: '#EAFBF1',
    },
    currentArrowButtonDisabled: {
      opacity: 0.35,
    },
    currentArrowLeft: {
      transform: [{ rotate: '180deg' }],
    },
    currentValue: {
      minWidth: moderateWidth(13),
      color: '#000000',
      textAlign: 'center',
      fontSize: moderateHeight(2.05),
      lineHeight: moderateHeight(2.6),
    },
    currentUnit: {
      fontSize: moderateHeight(1.45),
    },
    swipeContainer: {
      minHeight: moderateHeight(7.3),
    },
    swipeTrack: {
      flex: 1,
      borderWidth: 1,
      overflow: 'hidden',
      position: 'relative',
      borderColor: '#EEEEEE',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: moderateWidth(4),
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
      left: 0,
      bottom: 0,

      overflow: 'hidden',
      alignItems: 'center',
      width: moderateWidth(16),
      justifyContent: 'center',
      backgroundColor: '#10B8A3',
      borderRadius: moderateWidth(4),

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
    controlDisabled: {
      opacity: 0.55,
    },
    connectionErrorCard: {
      width: '100%',
      padding: moderateWidth(4),
      borderWidth: 1,
      borderColor: '#F3C2C4',
      borderRadius: moderateWidth(4),
      backgroundColor: '#FFF7F7',
      marginBottom: moderateHeight(1),
    },
    connectionErrorText: {
      color: '#9F1D24',
      fontSize: moderateHeight(1.55),
      lineHeight: moderateHeight(2.2),
    },
    retryButton: {
      alignSelf: 'center',
      width: moderateWidth(36),
      height: moderateHeight(5),
      borderRadius: moderateWidth(2.5),
    },
    chargerErrorCard: {
      width: '100%',
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(1.2),
      borderWidth: 1,
      borderColor: '#F4D38A',
      borderRadius: moderateWidth(4),
      backgroundColor: '#FFF9E8',
      marginBottom: moderateHeight(1),
    },
    chargerErrorTitle: {
      color: '#8A5A00',
      fontSize: moderateHeight(1.6),
      marginBottom: moderateHeight(0.3),
    },
    chargerErrorText: {
      color: '#6F4B0B',
      fontSize: moderateHeight(1.45),
      lineHeight: moderateHeight(2),
    },
    commandFeedback: {
      color: '#15803D',
      fontSize: moderateHeight(1.45),
      lineHeight: moderateHeight(2),
      marginTop: moderateHeight(1),
      paddingHorizontal: moderateWidth(4),
    },
    commandFeedbackError: {
      color: '#B4232A',
    },
  });
};

export default useStyles;
