import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingTop: moderateHeight(29),
      paddingBottom: moderateHeight(5),
      paddingHorizontal: moderateWidth(6),
    },
    containerBody: { width: '100%' },
    heading: {
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(3.2),
      marginBottom: moderateHeight(2),
    },
    registerButton: {
      height: moderateHeight(5.5),
      borderRadius: moderateWidth(3),
      marginTop: moderateHeight(1.5),
    },
    inputAction: {
      paddingVertical: moderateHeight(0.8),
      paddingLeft: moderateWidth(3),
    },
    inputActionText: {
      color: '#079CDD',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(1.5),
    },
    resendOtpButton: {
      // alignSelf: 'center',
      minWidth: moderateWidth(28),
      alignItems: 'flex-end',
      paddingVertical: moderateHeight(0.5),
      // paddingHorizontal: moderateWidth(4),
      marginBottom: moderateHeight(1),
    },
    accountRow: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: moderateHeight(1.5),
    },
    accountText: { fontSize: moderateHeight(1.5) },
    createAccountText: {
      color: '#079CDD',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(1.5),
    },
  });
};

export default useStyles;
