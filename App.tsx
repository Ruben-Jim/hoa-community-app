import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';

import HomeScreen from './src/screens/HomeScreen';
import BoardScreen from './src/screens/BoardScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import CovenantsScreen from './src/screens/CovenantsScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import FeesScreen from './src/screens/FeesScreen';
import BlockedAccountScreen from './src/screens/BlockedAccountScreen';
import AdminScreen from './src/screens/AdminScreen';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const { isAuthenticated, isLoading, isUserBlocked, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Check if user is blocked
  if (isUserBlocked()) {
    return <BlockedAccountScreen />;
  }

  const isBoardMember = user?.isBoardMember && user?.isActive;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#ffffff' },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, any> = {
            Home: 'home',
            Board: 'people',
            Community: 'chatbubbles',
            Covenants: 'document-text',
            Emergency: 'warning',
            Fees: 'card',
            Admin: 'settings',
          };
          const name = iconMap[route.name] ?? 'ellipse';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Board" component={BoardScreen} />
      <Tab.Screen name="Covenants" component={CovenantsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      {isBoardMember && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin',
          }}
        />
      )}
      {/* <Tab.Screen name="Fees" component={FeesScreen} /> */}
    </Tab.Navigator>
  );
};

export default function App() {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  const content = (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainApp />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );

  return convex ? (
    <ConvexProvider client={convex}>{content}</ConvexProvider>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  setupCode: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});
