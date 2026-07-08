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
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from '@hooks';
import { colors } from '@assets/colors';
import { Authorised } from './authorised';
import { ToastMessage } from '@components';
import { Unauthorised } from './unauthorised';
import { fetchCertificates } from '@store/slices/certificates/certificates';
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
  const dispatch = useDispatch();
  const fetchedCertificatesForTokenRef = useRef('');
  const { status } = useSelector((state: any) => state?.loginState);
  const currentTheme = useSelector((state: any) => state?.appTheme?.data);
  const loginToken = useSelector(
    (state: any) =>
      state?.login?.data?.data?.token || state?.register?.data?.data?.token,
  );
  const certificates = useSelector((state: any) => state?.certificates);

  const theme = useMemo(() => {
    const isDark = currentTheme === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [currentTheme]);

  useEffect(() => {
    flushNotificationNavigation();
  }, [status]);

  useEffect(() => {
    if (!status || !loginToken || certificates?.loading) {
      return;
    }

    if (fetchedCertificatesForTokenRef.current === loginToken) {
      return;
    }

    fetchedCertificatesForTokenRef.current = loginToken;
    console.log('[Certificates][MQTT] dispatching fetchCertificates after login');
    dispatch(fetchCertificates());
  }, [
    certificates?.loading,
    dispatch,
    loginToken,
    status,
  ]);

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
