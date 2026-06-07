import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDeviceDimensions } from '@hooks/useDeviceDimensions';

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    containerBG: {
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      height: moderateHeight(5),
      marginTop: moderateHeight(1.5),
      borderRadius: moderateWidth(2.5),
    },
    gradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    disabled: {
      opacity: 0.6,
    },
    label: {
      color: colors.white,
      fontSize: moderateHeight(2),
    },
    container: {
      borderColor: colors.secondary,
      marginTop: moderateHeight(1.5),
      borderWidth: moderateWidth(0.3),
      borderRadius: moderateWidth(10),
    },
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: moderateHeight(0.5),
      paddingHorizontal: moderateHeight(1),
    },
    bottom: {
      position: 'absolute',
      left: moderateWidth(5),
      right: moderateWidth(5),
      bottom: moderateWidth(5),
    },
  });
};

export default useStyles;
