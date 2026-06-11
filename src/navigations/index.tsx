import {
  Theme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//local imports
import { useEffect, useMemo } from 'react';
import { useSelector } from '@hooks';
import { colors } from '@assets/colors';
import { Authorised } from './authorised';
import { ToastMessage } from '@components';
import { Unauthorised } from './unauthorised';
import {
  flushNotificationNavigation,
  navigationRef,
} from './notificationNavigation';

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: colors.light,
  dark: false,
};

const darkTheme: Theme = {
  ...DefaultTheme,
  colors: colors.dark,
  dark: true,
};

const Navigation = () => {
  const { status } = useSelector((state: any) => state?.loginState);
  const currentTheme = useSelector((state: any) => state?.appTheme?.data);

  const theme = useMemo(() => {
    const isDark = currentTheme === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [currentTheme]);

  useEffect(() => {
    flushNotificationNavigation();
  }, [status]);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={theme}
        onReady={() => {
          BootSplash.hide({ fade: true });
          flushNotificationNavigation();
        }}
      >
        <GestureHandlerRootView style={styles.root}>
          {status ? <Authorised /> : <Unauthorised />}
          <ToastMessage />
        </GestureHandlerRootView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
