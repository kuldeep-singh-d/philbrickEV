import useStyles from './styles';
import React, {memo} from 'react';
import {useTheme} from '@react-navigation/native';
import {View, ActivityIndicator, ColorValue} from 'react-native';

interface LoaderProps {
  visible?: boolean;
  loaderColor?: ColorValue;
}

const Loader = ({visible = false, loaderColor}: LoaderProps) => {
  const styles = useStyles();
  const {colors} = useTheme();
  if (!visible) return null;
  const color = loaderColor || colors?.primary;

  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

export default memo(Loader);
