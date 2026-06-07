import fonts from '@assets/fonts';
import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks/index';
import { useTheme } from '@react-navigation/native';

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: moderateWidth(2),
      marginBottom: moderateHeight(2),
    },
    wrapper: {
      flex: 1,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      height: moderateHeight(5.5),
      backgroundColor: colors.white,
      justifyContent: 'center',
      paddingHorizontal: moderateWidth(3.5),
      borderRadius: moderateWidth(2.5),
      borderColor: colors.text,
      borderWidth: moderateWidth(0.5),
    },

    input: {
      flex: 1,
      color: colors.text,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.regular,
      height: moderateHeight(5),
      includeFontPadding: false,
      fontSize: moderateHeight(2),
      textAlignVertical: 'center',
    },
    filter: {
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateHeight(5),
      height: moderateHeight(5),
      borderRadius: moderateWidth(2),
      backgroundColor: colors.secondary,
    },
  });
};

export default useStyles;
