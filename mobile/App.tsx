import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UserRole } from './src/types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';

// Client Screens
import { ClientHomeScreen } from './src/screens/client/HomeScreen';
import { NewRequestScreen } from './src/screens/client/NewRequestScreen';
import { RequestDetailScreen } from './src/screens/client/RequestDetailScreen';

// Mechanic Screens
import { MechanicHomeScreen } from './src/screens/mechanic/MechanicHomeScreen';
import { JobDetailScreen } from './src/screens/mechanic/JobDetailScreen';

// Common Screens
import { MechanicProfileScreen } from './src/screens/common/MechanicProfileScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const ClientStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1E40AF' },
      headerTintColor: '#FFF',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="NewRequest" component={NewRequestScreen} options={{ title: 'Nova Solicitação' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Detalhes' }} />
    <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} options={{ title: 'Perfil do Mecânico' }} />
  </Stack.Navigator>
);

const MechanicStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#FFF',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="MechanicHome" component={MechanicHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Detalhes do Chamado' }} />
    <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} options={{ title: 'Perfil' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === UserRole.MECHANIC ? (
        <MechanicStack />
      ) : (
        <ClientStack />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
