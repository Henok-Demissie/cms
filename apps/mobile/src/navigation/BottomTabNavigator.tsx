import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { palette } from '../theme';

const Tab = createBottomTabNavigator();

// Placeholder screens for other tabs
function CasesScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>All Cases</Text>
      <Text style={styles.placeholderSub}>List of cases will appear here</Text>
    </View>
  );
}

function SuggestionsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Suggestions</Text>
      <Text style={styles.placeholderSub}>Helpful tips and recommendations</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Profile</Text>
      <Text style={styles.placeholderSub}>User settings and info</Text>
    </View>
  );
}

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.bg,
          borderTopColor: palette.border,
          height: 60,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Cases') iconName = focused ? 'folder-open' : 'folder-outline';
          else if (route.name === 'Suggestions') iconName = focused ? 'bulb' : 'bulb-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Cases" component={CasesScreen} />
      <Tab.Screen name="Suggestions" component={SuggestionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.bg,
    padding: 20,
  },
  placeholderText: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderSub: {
    color: palette.muted,
    fontSize: 16,
    textAlign: 'center',
  },
});