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
    sendButton: {
      height: moderateHeight(5.5),
      borderRadius: moderateWidth(3),
      marginTop: moderateHeight(1.5),
    },
    inputAction: {
      paddingLeft: moderateWidth(3),
      paddingVertical: moderateHeight(1),
    },
    inputActionText: {
      color: '#0BB2C3',
      fontSize: moderateHeight(1.5),
    },
    otpTimerText: {
      color: '#6B7280',
      marginTop: -moderateHeight(0.2),
      marginBottom: moderateHeight(1.2),
      fontSize: moderateHeight(1.45),
    },
    resendOtpButton: {
      alignSelf: 'center',
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(1),
      marginBottom: moderateHeight(1),
    },
    resendOtpText: {
      color: '#0BB2C3',
      fontSize: moderateHeight(1.55),
    },
    backButton: {
      alignSelf: 'center',
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(2.3),
    },
    backText: { fontSize: moderateHeight(1.5) },
  });
};

export default useStyles;
