import {
  View,
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
  StatusBar,
  StyleSheet,
  RefreshControlProps,
} from 'react-native';
import { images } from '@assets/imgaes';
import { Svgs } from '@assets/svgs';
import React, { ReactElement, ReactNode } from 'react';
import { useDeviceDimensions } from '@hooks';
import { KeyboardAvoider } from '@components';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthorisedScreenProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showBackButton?: boolean;
  roundedHeader?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
}

export const AuthorisedScreen = ({
  children,
  contentStyle,
  showBackButton = false,
  roundedHeader = false,
  refreshControl,
}: AuthorisedScreenProps) => {
  const styles = useStyles();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        showHideTransition={'fade'}
      />
      <View
        style={[styles.brandHeader, roundedHeader && styles.roundedBrandHeader]}
      >
        {showBackButton ? (
          <Pressable
            hitSlop={8}
            onPress={navigation.goBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Svgs.AlertBackArrow
              width={styles.backIcon.width}
              height={styles.backIcon.height}
            />
          </Pressable>
        ) : null}
        <Image
          resizeMode="contain"
          source={images.headerLogo}
          style={styles.brandLogo}
        />
      </View>

      <KeyboardAvoider
        refreshControl={refreshControl}
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
    roundedBrandHeader: {
      paddingTop: insets.top + moderateHeight(1),
      paddingBottom: moderateHeight(5.2),
      borderBottomLeftRadius: moderateWidth(13),
      borderBottomRightRadius: moderateWidth(13),
    },
    brandLogo: {
      width: moderateWidth(46),
      height: moderateHeight(7.5),
    },
    backButton: {
      position: 'absolute',
      zIndex: 1,
      left: moderateWidth(6),
      top: insets.top + moderateHeight(2.2),
      width: moderateWidth(9),
      height: moderateWidth(9),
      maxWidth: 42,
      maxHeight: 42,
      borderWidth: 1,
      borderColor: '#EEEEEE',
      borderRadius: moderateWidth(3),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    backIcon: {
      width: moderateWidth(5.5),
      height: moderateWidth(5.5),
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
