import { useEffect } from 'react';
import {
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  addMqttMessageListener,
  publishMqttMessage,
  startMqttConnection,
  subscribeMqttTopic,
} from './src/mqtt/mqttClient';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = addMqttMessageListener(({ topic, message }) => {
      console.log(Platform.OS, 'MQTT message received', {
        topic,
        message,
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleStartMqttConnection = () => {
    startMqttConnection()
      .then(result => {
        console.log(Platform.OS, 'MQTT connection result', result);
      })
      .catch(error => {
        console.log(Platform.OS, 'MQTT connection failed', error);
      });
  };

  const handleSubscribeMqttTopic = () => {
    subscribeMqttTopic('ev/#')
      .then(result => {
        console.log(Platform.OS, 'MQTT subscribe result', result);
      })
      .catch(error => {
        console.log(Platform.OS, 'MQTT subscribe failed', error);
      });
  };

  const handlePublishMqttMessage = () => {
    publishMqttMessage()
      .then(result => {
        console.log(Platform.OS, 'MQTT publish result', result);
      })
      .catch(error => {
        console.log(Platform.OS, 'MQTT publish failed', error);
      });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: safeAreaInsets.bottom + 16 },
        ]}
      >
        <Button
          title="Start MQTT Connection"
          onPress={handleStartMqttConnection}
        />
        <View style={styles.buttonSpacing} />
        <Button title="Subscribe ev/#" onPress={handleSubscribeMqttTopic} />
        <View style={styles.buttonSpacing} />
        <Button title="Publish MQTT Message" onPress={handlePublishMqttMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  buttonSpacing: {
    height: 12,
  },
});

export default App;
