import { createNativeStackNavigator } from '@react-navigation/native-stack';

//local imports
import { routes } from '../routes';
import * as Screens from '@screens/index';
// import { routes } from '@navigation/routes';

const Stack = createNativeStackNavigator();

export function Unauthorised() {
  const { login } = routes.auth;
  return (
    <Stack.Navigator
      initialRouteName={login}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={login} component={Screens.Login} />
      <Stack.Screen
        name={routes.auth.registration}
        component={Screens.Registration}
      />
      <Stack.Screen
        name={routes.auth.forgotPassword}
        component={Screens.ForgotPass}
      />
    </Stack.Navigator>
  );
}
