import fonts from '@assets/fonts';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDeviceDimensions } from '@hooks/useDeviceDimensions';

const useStyles = (fadeAnim: Animated.Value) => {
  const { colors } = useTheme();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    // ── Trigger ──
    wrapper: {
      width: '100%',
      marginTop: moderateHeight(1),
    },
    title: {
      flex: 1,
      color: colors.text as string,
      marginBottom: moderateHeight(0.3),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: moderateHeight(5),
      borderWidth: moderateWidth(0.4),
      justifyContent: 'space-between',
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(4),
      borderColor: colors.border as string,
      paddingVertical: moderateHeight(0.5),
    },
    placeholderText: {
      flex: 1,
    },
    selectedText: {
      flex: 1,
      // fontSize: moderateHeight(1.8),
    },
    errorText: {
      textAlign: 'right',
      marginTop: moderateHeight(0.5),
    },

    // ── Chips (multi-select trigger) ──
    chipsContentContainer: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      rowGap: moderateHeight(0.7),
      columnGap: moderateWidth(1.5),
      paddingVertical: moderateHeight(0.35),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateWidth(1),
      borderRadius: moderateWidth(4),
      paddingVertical: moderateHeight(0.3),
      paddingHorizontal: moderateWidth(2.5),
      backgroundColor: `rgba(59, 130, 246, 0.12)`,
    },
    chipLabel: {
      fontFamily: fonts.medium,
      fontSize: moderateHeight(1.5),
      color: colors.primary as string,
    },
    chipClose: {
      padding: moderateWidth(0.5),
    },
    chipCloseText: {
      fontSize: moderateHeight(1.3),
      color: colors.primary as string,
    },

    // ── Modal ──
    modalOverlay: {
      flex: 1,
      opacity: fadeAnim,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    keyboardAvoider: {
      flex: 1,
    },
    overlayPress: {
      flex: 1,
    },
    modalCard: {
      maxHeight: '70%',
      shadowColor: '#000',
      paddingBottom: moderateHeight(3),
      borderTopLeftRadius: moderateWidth(5),
      borderTopRightRadius: moderateWidth(5),
      backgroundColor: colors.white as string,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 10,
      transform: [
        {
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
          }),
        },
      ],
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: moderateHeight(2),
      justifyContent: 'space-between',
      paddingBottom: moderateHeight(1),
      paddingHorizontal: moderateWidth(5),
    },
    modalTitle: {
      fontFamily: fonts.semibold,
      color: colors.text as string,
      fontSize: moderateHeight(2.2),
    },
    modalCloseBtn: {
      padding: moderateWidth(1),
    },

    // ── Search inside modal ──
    searchContainer: {
      marginBottom: moderateHeight(1),
      paddingHorizontal: moderateWidth(5),
    },
    searchInput: {
      paddingVertical: 0,
      fontFamily: fonts.regular,
      includeFontPadding: false,
      textAlignVertical: 'center',
      height: moderateHeight(5),
      borderColor: colors.border,
      color: colors.text as string,
      fontSize: moderateHeight(1.8),
      borderWidth: moderateWidth(0.4),
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(4),
    },

    // ── List items ──
    listContentContainer: {
      paddingHorizontal: moderateWidth(5),
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateHeight(1.5),
      borderBottomColor: colors.border as string,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemLabel: {
      flex: 1,
      fontFamily: fonts.regular,
      color: colors.text as string,
      fontSize: moderateHeight(1.9),
    },
    itemSelected: {
      fontFamily: fonts.medium,
      color: colors.primary as string,
    },
    checkIcon: {
      marginLeft: moderateWidth(2),
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: moderateHeight(4),
    },
    emptyText: {
      fontFamily: fonts.regular,
      color: colors.gray as string,
      fontSize: moderateHeight(1.8),
    },
  });
};

export default useStyles;
