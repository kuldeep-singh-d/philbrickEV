import { createNativeStackNavigator } from '@react-navigation/native-stack';

//local imports
import { useSelector } from '@hooks';
import { routes } from '../routes';
import * as Screens from '@screens/index';
import { MainTabs } from './bottomTabs';

const Stack = createNativeStackNavigator();

export function Authorised() {
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const { addDevice, alerts, apiTest, mainTabs, selectDevice, updatePassword } =
    routes.app;

  return (
    <Stack.Navigator
      initialRouteName={selectedDevice ? mainTabs : selectDevice}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={mainTabs} component={MainTabs} />
      <Stack.Screen name={alerts} component={Screens.Alerts} />
      <Stack.Screen name={addDevice} component={Screens.AddDevice} />
      <Stack.Screen name={selectDevice} component={Screens.SelectDevice} />
      <Stack.Screen name={updatePassword} component={Screens.UpdatePassword} />
      <Stack.Screen name={apiTest} component={Screens.ApiTest} />
    </Stack.Navigator>
  );
}
