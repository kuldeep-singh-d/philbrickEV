import React from 'react';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from 'react-native-reanimated';
import Navigation from 'src/navigations';
import store from '@store/configureStore';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const persistor = persistStore(store);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation />
      </PersistGate>
    </Provider>
  );
};

export default App;

// import { useEffect } from 'react';
// import {
//   Button,
//   Platform,
//   StatusBar,
//   StyleSheet,
//   useColorScheme,
//   View,
// } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import Toast from 'react-native-toast-message';
// import {
//   addMqttMessageListener,
//   publishMqttMessage,
//   startMqttConnection,
//   subscribeMqttTopic,
// } from './src/mqtt/mqttClient';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//       <Toast />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   useEffect(() => {
//     const subscription = addMqttMessageListener(({ topic, message }) => {
//       console.log(Platform.OS, 'MQTT message received', {
//         topic,
//         message,
//       });
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   const handleStartMqttConnection = () => {
//     startMqttConnection()
//       .then(result => {
//         console.log(Platform.OS, 'MQTT connection result', result);
//       })
//       .catch(error => {
//         console.log(Platform.OS, 'MQTT connection failed', error);
//       });
//   };

//   const handleSubscribeMqttTopic = () => {
//     subscribeMqttTopic('ev/#')
//       .then(result => {
//         console.log(Platform.OS, 'MQTT subscribe result', result);
//       })
//       .catch(error => {
//         console.log(Platform.OS, 'MQTT subscribe failed', error);
//       });
//   };

//   const handlePublishMqttMessage = () => {
//     publishMqttMessage()
//       .then(result => {
//         console.log(Platform.OS, 'MQTT publish result', result);
//       })
//       .catch(error => {
//         console.log(Platform.OS, 'MQTT publish failed', error);
//       });
//   };

//   return (
//     <View style={styles.container}>
//       <View
//         style={[
//           styles.buttonContainer,
//           { paddingBottom: safeAreaInsets.bottom + 16 },
//         ]}
//       >
//         <Button
//           title="Start MQTT Connection"
//           onPress={handleStartMqttConnection}
//         />
//         <View style={styles.buttonSpacing} />
//         <Button title="Subscribe ev/#" onPress={handleSubscribeMqttTopic} />
//         <View style={styles.buttonSpacing} />
//         <Button
//           title="Publish MQTT Message"
//           onPress={handlePublishMqttMessage}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonContainer: {
//     paddingTop: 12,
//     paddingHorizontal: 16,
//   },
//   buttonSpacing: {
//     height: 12,
//   },
// });

// export default App;
