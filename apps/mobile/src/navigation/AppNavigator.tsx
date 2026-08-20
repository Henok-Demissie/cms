import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HeroScreen } from '../screens/HeroScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CustomerRegisterScreen } from '../screens/CustomerRegisterScreen';
import { BusinessRegisterScreen } from '../screens/BusinessRegisterScreen';
import { BottomTabNavigator } from './BottomTabNavigator';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { user } = useAuth();
  const { palette } = useTheme();
  const isLoggedIn = !!user;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: palette.bg } }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Hero" component={HeroScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CustomerRegister" component={CustomerRegisterScreen} />
          <Stack.Screen name="BusinessRegister" component={BusinessRegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
