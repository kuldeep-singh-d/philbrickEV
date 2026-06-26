import { StyleSheet } from 'react-native';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      paddingTop: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateHeight(1.4),
    },
    headerCopy: {
      flex: 1,
      paddingRight: moderateWidth(3),
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
    changeDeviceButton: {
      width: moderateWidth(24),
      height: moderateHeight(4.2),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#31C44C',
      borderRadius: moderateWidth(2.4),
      backgroundColor: '#F6FFF7',
    },
    pressedChangeDeviceButton: {
      opacity: 0.75,
    },
    changeDeviceText: {
      color: '#249D3D',
      fontSize: moderateHeight(1.45),
      lineHeight: moderateHeight(2),
    },
    loader: {
      marginVertical: moderateHeight(4),
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
    emptyActionButton: {
      width: '72%',
      marginTop: moderateHeight(2),
      borderRadius: moderateWidth(2.6),
      overflow: 'hidden',
    },
    sessionCard: {
      width: '100%',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      borderRadius: moderateWidth(3),
      backgroundColor: '#FFFFFF',
      marginBottom: moderateHeight(1.2),
      paddingVertical: moderateHeight(1.3),
      paddingHorizontal: moderateWidth(4),
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    sessionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    sessionTitleContainer: {
      flex: 1,
      paddingRight: moderateWidth(3),
    },
    sessionTitle: {
      color: '#111827',
      fontSize: moderateHeight(1.8),
      lineHeight: moderateHeight(2.5),
      marginBottom: moderateHeight(0.2),
    },
    sessionSubtitle: {
      color: '#6B7280',
      fontSize: moderateHeight(1.4),
      lineHeight: moderateHeight(2),
    },
    statusPill: {
      borderRadius: moderateWidth(4),
      backgroundColor: '#EAFBF1',
      paddingVertical: moderateHeight(0.45),
      paddingHorizontal: moderateWidth(2.6),
    },
    statusPillActive: {
      backgroundColor: '#E7F9FB',
    },
    statusText: {
      color: '#249D3D',
      fontSize: moderateHeight(1.2),
      lineHeight: moderateHeight(1.7),
    },
    statusTextActive: {
      color: '#0A9FAC',
    },
    sessionDivider: {
      height: 1,
      backgroundColor: '#EEF2F7',
      marginVertical: moderateHeight(1.2),
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: moderateWidth(-1),
    },
    metricItem: {
      width: '50%',
      paddingHorizontal: moderateWidth(1),
      marginBottom: moderateHeight(1),
    },
    metricLabel: {
      color: '#6B7280',
      fontSize: moderateHeight(1.25),
      lineHeight: moderateHeight(1.8),
      marginBottom: moderateHeight(0.25),
    },
    metricValue: {
      color: '#1F2937',
      fontSize: moderateHeight(1.45),
      lineHeight: moderateHeight(2.1),
    },
    inlineError: {
      color: '#B42318',
      fontSize: moderateHeight(1.4),
      lineHeight: moderateHeight(2),
      marginTop: moderateHeight(0.5),
    },
    loadMoreButton: {
      marginBottom: moderateHeight(3),
      borderRadius: moderateWidth(2.6),
      overflow: 'hidden',
    },
  });
};

export default useStyles;
