import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';

const useStyles = () => {
  const {colors} = useTheme();

  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.overlay,
    },
  });
};
export default useStyles;
