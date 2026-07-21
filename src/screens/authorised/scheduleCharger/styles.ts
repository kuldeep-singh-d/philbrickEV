import { StyleSheet } from 'react-native';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingTop: 0,
    },
    headerCopy: {
      marginBottom: moderateHeight(1.4),
    },
    heading: {
      color: '#111827',
      fontSize: moderateHeight(2.2),
      lineHeight: moderateHeight(3),
    },
    subheading: {
      color: '#607578',
      fontSize: moderateHeight(1.45),
      lineHeight: moderateHeight(2.1),
      marginTop: moderateHeight(0.25),
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
    scheduleCard: {
      width: '100%',
      borderWidth: 1.5,
      borderColor: '#D8F5DD',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FFFFFF',
      marginBottom: moderateHeight(1.2),
      paddingVertical: moderateHeight(1.5),
      paddingHorizontal: moderateWidth(4),
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    scheduleCardPressed: {
      opacity: 0.78,
    },
    scheduleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateHeight(1),
    },
    scheduleTitleContainer: {
      flex: 1,
      paddingRight: moderateWidth(3),
    },
    scheduleTitle: {
      color: '#111827',
      fontSize: moderateHeight(1.8),
      lineHeight: moderateHeight(2.5),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: moderateHeight(1.4),
    },
    infoIconContainer: {
      alignItems: 'center',
      width: moderateWidth(8),
      height: moderateWidth(8),
      justifyContent: 'center',
      backgroundColor: '#EAFBF1',
      borderRadius: moderateWidth(4),
      marginRight: moderateWidth(2.4),
    },
    infoIcon: {
      width: moderateWidth(4.2),
      height: moderateWidth(4.2),
    },
    infoCopy: {
      flex: 1,
    },
    timeText: {
      color: '#111827',
      fontSize: moderateHeight(1.55),
      lineHeight: moderateHeight(2.2),
      marginBottom: moderateHeight(0.25),
    },
    deviceIdText: {
      color: '#6B7280',
      lineHeight: moderateHeight(2),
      fontSize: moderateHeight(1.35),
    },
    weekdayRow: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateWidth(1.4),
      justifyContent: 'flex-start',
    },
    weekdayCircle: {
      borderWidth: 1,
      alignItems: 'center',
      borderColor: '#D1D5DB',
      justifyContent: 'center',
      width: moderateWidth(9.4),
      height: moderateWidth(9.4),
      backgroundColor: '#FFFFFF',
      borderRadius: moderateWidth(4.7),
    },
    weekdayActive: {
      borderColor: '#31C44C',
      backgroundColor: '#EAFBF1',
    },
    weekdayText: {
      color: '#6B7280',
      fontSize: moderateHeight(1.15),
      lineHeight: moderateHeight(1.7),
    },
    weekdayTextActive: {
      color: '#249D3D',
    },
    footer: {
      marginTop: 'auto',
      paddingTop: moderateHeight(1.2),
      paddingBottom: moderateHeight(3),
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
    refreshPillText: {
      color: '#6B7280',
      fontSize: moderateHeight(1.4),
      lineHeight: moderateHeight(1.8),
    },
    addButton: {
      overflow: 'hidden',
      borderRadius: moderateWidth(2.6),
    },
  });
};

export default useStyles;
