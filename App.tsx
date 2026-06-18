import React, { Component, ReactNode, useEffect } from 'react';
import { Button, Text, View } from 'react-native';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from 'react-native-reanimated';
import Navigation from 'src/navigations';
import store from '@store/configureStore';
import {
  initializeNotificationListeners,
  requestNotificationPermissionAndToken,
} from './src/services/handleNotification';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const persistor = persistStore(store);

type ErrorBoundaryState = {
  errorMessage: string;
  hasError: boolean;
};

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    errorMessage: '',
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      errorMessage:
        error instanceof Error ? error.message : 'Something went wrong.',
      hasError: true,
    };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.warn('[App ErrorBoundary]', {
      error: error instanceof Error ? error.message : String(error),
      info,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ marginBottom: 12, textAlign: 'center' }}>
            The app hit an error and recovered safely.
          </Text>
          <Text style={{ marginBottom: 16, textAlign: 'center' }}>
            {this.state.errorMessage}
          </Text>
          <Button
            title="Retry"
            onPress={() => this.setState({ errorMessage: '', hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    const unsubscribe = initializeNotificationListeners();

    requestNotificationPermissionAndToken().catch(error => {
      console.warn(
        'Unable to request notification permission:',
        error instanceof Error ? error.message : String(error),
      );
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppErrorBoundary>
          <Navigation />
        </AppErrorBoundary>
      </PersistGate>
    </Provider>
  );
};

export default App;
