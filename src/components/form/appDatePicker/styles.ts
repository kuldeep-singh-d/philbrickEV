import { StyleSheet } from 'react-native';
import { useDeviceDimensions } from '@hooks/index';
import { useTheme } from '@react-navigation/native';

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateHeight, moderateWidth } = useDeviceDimensions();

  return StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: moderateHeight(1),
    },
    title: {
      flex: 1,
      color: colors.text,
      marginBottom: moderateHeight(0.3),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      height: moderateHeight(5),
      borderColor: colors.border,
      borderWidth: moderateWidth(0.4),
      justifyContent: 'space-between',
      borderRadius: moderateWidth(2.5),
      paddingHorizontal: moderateWidth(4),
    },
    displayValue: {
      flex: 1,
    },
    errorText: {
      textAlign: 'right',
      marginTop: moderateHeight(0.5),
    },
  });
};

export default useStyles;
