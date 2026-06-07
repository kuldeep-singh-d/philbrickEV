import React, { ReactNode, useEffect } from 'react';
import { View, Pressable, StyleSheet, BackHandler } from 'react-native';

import { Svgs } from '@assets/svgs';
import { useDeviceDimensions } from '@hooks/index';
import { AppText, KeyboardAvoider, Loader } from '@components';
import { useTheme, useNavigation } from '@react-navigation/native';

interface AppContainerProps {
  loading?: boolean;
  listing?: boolean;
  canLogout?: boolean;
  children?: ReactNode;
  hideBackBtn?: boolean;
  title?: string | undefined;
}

const AppContainer = ({
  loading,
  listing,
  children,
  title = '',
  canLogout = false,
  hideBackBtn = false,
}: AppContainerProps) => {
  const styles = useStyles();
  // const { logout, username } = useAuthStore();
  // const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const { moderateHeight } = useDeviceDimensions();

  const handleBackBtn = (): void => {
    navigation.goBack();
  };

  useEffect(() => {
    const handleBackButton = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  const handleLogout = () => {
    // logout();
    // queryClient.clear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleView}>
          {!hideBackBtn && (
            <Pressable onPress={handleBackBtn} style={styles.backBtn}>
              <Svgs.BackArrow
                width={moderateHeight(3)}
                height={moderateHeight(3)}
              />
            </Pressable>
          )}
          <View>
            <AppText
              semibold
              label={title}
              numberOfLines={1}
              style={styles.title}
            />
          </View>
        </View>

        {canLogout && (
          <Pressable
            onPress={handleLogout}
            style={styles.logoutBtn}
            hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
          />
        )}
      </View>

      {listing !== undefined ? (
        <View style={styles.keyboardAwar}>{children}</View>
      ) : (
        <KeyboardAvoider contentContainerStyle={styles.keyboardAwar}>
          {children}
        </KeyboardAvoider>
      )}
      {loading && <Loader visible={loading} />}
    </View>
  );
};

export default AppContainer;

const useStyles = () => {
  const { colors } = useTheme();
  const { moderateWidth, moderateHeight } = useDeviceDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },

    backBtn: {},
    keyboardAwar: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingHorizontal: moderateWidth(5),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateHeight(1),
      paddingHorizontal: moderateWidth(5),
    },
    title: {
      marginLeft: moderateWidth(3),
      fontSize: moderateHeight(2.4),
    },
    userID: {
      marginLeft: moderateWidth(3),
      fontSize: moderateHeight(1.6),
    },
    titleView: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    logoutBtn: {},
  });
};
