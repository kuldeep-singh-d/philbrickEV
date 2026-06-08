import {
  View,
  Image,
  StyleProp,
  ViewStyle,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { images } from '@assets/imgaes';
import React, { ReactNode } from 'react';
import { useDeviceDimensions } from '@hooks';
import { KeyboardAvoider } from '@components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthorisedScreenProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export const AuthorisedScreen = ({
  children,
  contentStyle,
}: AuthorisedScreenProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        showHideTransition={'fade'}
      />
      <View style={styles.brandHeader}>
        <Image
          resizeMode="contain"
          source={images.headerLogo}
          style={styles.brandLogo}
        />
      </View>

      <KeyboardAvoider
        contentContainerStyle={[styles.contentContainer, contentStyle]}
      >
        {children}
      </KeyboardAvoider>
    </View>
  );
};

const useStyles = () => {
  const insets = useSafeAreaInsets();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    brandHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D8F5DD',
      paddingBottom: moderateHeight(0.5),
      paddingTop: insets.top + moderateHeight(-1),
    },
    brandLogo: {
      width: moderateWidth(46),
      height: moderateHeight(7.5),
    },
    contentContainer: {
      flexGrow: 1,
      backgroundColor: '#FFFFFF',
      paddingTop: moderateHeight(3),
      paddingBottom: moderateHeight(4),
      paddingHorizontal: moderateWidth(6),
    },
  });
};

export default AuthorisedScreen;
