import { StyleSheet } from 'react-native';

import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingTop: moderateHeight(2.6),
    },
    header: {
      marginBottom: moderateHeight(1.2),
    },
    heading: {
      color: '#111827',
      fontSize: moderateHeight(2.2),
      lineHeight: moderateHeight(3),
      marginBottom: moderateHeight(0.35),
    },
    description: {
      color: '#607578',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
    loader: {
      marginVertical: moderateHeight(4),
    },
    emptyState: {
      minHeight: moderateHeight(22),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#D8F5DD',
      borderRadius: moderateWidth(4),
      backgroundColor: '#F6FFF7',
      paddingHorizontal: moderateWidth(6),
      paddingVertical: moderateHeight(3),
    },
    emptyTitle: {
      color: '#1F2937',
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(2.8),
      marginBottom: moderateHeight(0.7),
    },
    emptyDescription: {
      color: '#6B7280',
      fontSize: moderateHeight(1.5),
      lineHeight: moderateHeight(2.2),
    },
    actionButton: {
      width: '72%',
      marginTop: moderateHeight(2),
      borderRadius: moderateWidth(2.6),
      overflow: 'hidden',
    },
    card: {
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
    activeCard: {
      borderColor: '#0BB2C3',
      backgroundColor: '#F8FEFF',
    },
    pressedCard: {
      opacity: 0.8,
    },
    disabledCard: {
      opacity: 0.65,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    cardCopy: {
      flex: 1,
      paddingRight: moderateWidth(3),
    },
    cardTitle: {
      color: '#111827',
      fontSize: moderateHeight(1.8),
      lineHeight: moderateHeight(2.5),
      marginBottom: moderateHeight(0.2),
    },
    cardSubtitle: {
      color: '#6B7280',
      fontSize: moderateHeight(1.4),
      lineHeight: moderateHeight(2),
    },
    badge: {
      borderRadius: moderateWidth(4),
      backgroundColor: '#EAFBF1',
      paddingVertical: moderateHeight(0.45),
      paddingHorizontal: moderateWidth(2.6),
    },
    badgeText: {
      color: '#249D3D',
      fontSize: moderateHeight(1.2),
      lineHeight: moderateHeight(1.7),
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#EEF2F7',
      marginTop: moderateHeight(1.1),
      paddingTop: moderateHeight(1),
    },
    metaText: {
      color: '#607578',
      fontSize: moderateHeight(1.3),
      lineHeight: moderateHeight(1.9),
    },
    detailContainer: {
      borderTopWidth: 1,
      borderTopColor: '#DDEFF1',
      marginTop: moderateHeight(1.2),
      paddingTop: moderateHeight(1.1),
    },
    detailRow: {
      marginBottom: moderateHeight(0.85),
    },
    detailLabel: {
      color: '#0A8E9B',
      textTransform: 'capitalize',
      fontSize: moderateHeight(1.25),
      lineHeight: moderateHeight(1.8),
      marginBottom: moderateHeight(0.15),
    },
    detailValue: {
      color: '#1F2937',
      fontSize: moderateHeight(1.35),
      lineHeight: moderateHeight(1.95),
    },
    detailHint: {
      color: '#607578',
      fontSize: moderateHeight(1.35),
      lineHeight: moderateHeight(1.95),
    },
    errorText: {
      color: '#B42318',
      fontSize: moderateHeight(1.35),
      lineHeight: moderateHeight(1.95),
    },
  });
};

export default useStyles;
