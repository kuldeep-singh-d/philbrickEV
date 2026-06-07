import { createNativeStackNavigator } from '@react-navigation/native-stack';

//local imports
import { routes } from '../routes';
import * as Screens from '@screens/index';
// import { routes } from '@navigation/routes';

const Stack = createNativeStackNavigator();

export function Authorised() {
  const { login } = routes.auth;
  return (
    <Stack.Navigator
      initialRouteName={login}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={login} component={Screens.Dashboard} />
    </Stack.Navigator>
  );
}
