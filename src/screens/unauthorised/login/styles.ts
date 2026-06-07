import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks';

export const useStyles = () => {
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: moderateHeight(29),
      paddingBottom: moderateHeight(5),
      paddingHorizontal: moderateWidth(6),
    },
    containerBody: {
      width: '100%',
    },
    heading: {
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(2),
      lineHeight: moderateHeight(3.2),
      marginBottom: moderateHeight(2),
    },

    loginButton: {
      height: moderateHeight(5.5),
      borderRadius: moderateWidth(3),
      marginTop: moderateHeight(1.5),
    },
    forgotButton: {
      alignSelf: 'center',
      paddingHorizontal: moderateWidth(4),
      paddingVertical: moderateHeight(2.3),
    },
    forgotText: {
      fontSize: moderateHeight(1.5),
    },
    accountRow: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountText: {
      fontSize: moderateHeight(1.5),
    },
    createAccountText: {
      color: '#079CDD',
      fontFamily: fonts.semibold,
      fontSize: moderateHeight(1.5),
    },
  });
};
