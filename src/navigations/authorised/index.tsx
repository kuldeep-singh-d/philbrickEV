import { createNativeStackNavigator } from '@react-navigation/native-stack';

//local imports
import { useSelector } from '@hooks';
import { routes } from '../routes';
import * as Screens from '@screens/index';
// import { routes } from '@navigation/routes';

const Stack = createNativeStackNavigator();

export function Authorised() {
  const selectedDevice = useSelector(state => state.selectedDevice.data);
  const {
    addDevice,
    alerts,
    dashboard,
    selectDevice,
    settings,
    updatePassword,
  } = routes.app;

  return (
    <Stack.Navigator
      initialRouteName={selectedDevice ? dashboard : selectDevice}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={settings} component={Screens.Settings} />
      <Stack.Screen name={alerts} component={Screens.Alerts} />
      <Stack.Screen name={addDevice} component={Screens.AddDevice} />
      <Stack.Screen name={dashboard} component={Screens.Dashboard} />
      <Stack.Screen name={selectDevice} component={Screens.SelectDevice} />
      <Stack.Screen name={updatePassword} component={Screens.UpdatePassword} />
    </Stack.Navigator>
  );
}
