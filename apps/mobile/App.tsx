import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Root() {
  const { palette, mode } = useTheme();
  const isDark = mode === 'dark';

  // Give React Navigation the matching base theme so its own chrome (card
  // backgrounds during transitions, default text) doesn't flash the wrong shade.
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: palette.bg,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <LinearGradient colors={palette.gradient} style={StyleSheet.absoluteFill} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
