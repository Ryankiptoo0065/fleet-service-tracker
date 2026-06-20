// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import AddVehicleScreen from './src/screens/AddVehicleScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import EditVehicleScreen from './src/screens/EditVehicleScreen';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function SignOutButton() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
      <Text style={{ color: colors.paper, fontWeight: '600', fontSize: 13 }}>Sign out</Text>
    </TouchableOpacity>
  );
}

function VehiclesStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.paper,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="VehiclesList" component={VehiclesScreen} options={{ title: 'Vehicles' }} />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{ title: 'Add Vehicle' }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: 'Vehicle' }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{ title: 'Edit Vehicle' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.paper,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <SignOutButton />,
        tabBarActiveTintColor: colors.signal,
        tabBarInactiveTintColor: colors.steel,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.line },
        tabBarIcon: () => null,
        headerShown: route.name !== 'VehiclesTab',
      })}
    >
      <Tabs.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ title: 'Dashboard', tabBarLabel: '📊 Dashboard' }}
      />
      <Tabs.Screen
        name="VehiclesTab"
        component={VehiclesStackScreen}
        options={{ title: 'Vehicles', tabBarLabel: '🚛 Vehicles' }}
      />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator size="large" color={colors.signal} />
      </View>
    );
  }

  return user ? <MainTabs /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
