import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

import HomeScreen from './src/screens/HomeScreen';
import BoardScreen from './src/screens/BoardScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import CovenantsScreen from './src/screens/CovenantsScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import FeesScreen from './src/screens/FeesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!convex) {
    return (
      <View style={styles.setupContainer}>
        <Text style={styles.setupTitle}>Convex not configured</Text>
        <Text style={styles.setupText}>
          Start the Convex dev server and set your URL to enable data features.
        </Text>
        <Text style={styles.setupCode}>npx convex dev</Text>
        <Text style={styles.setupText}>
          Then set EXPO_PUBLIC_CONVEX_URL or add expo.extra.convexUrl in app.json.
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <NavigationContainer>
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
              };
              const name = iconMap[route.name] ?? 'ellipse';
              return <Ionicons name={name as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Board" component={BoardScreen} />
          <Tab.Screen name="Community" component={CommunityScreen} />
          <Tab.Screen name="Covenants" component={CovenantsScreen} />
          <Tab.Screen name="Emergency" component={EmergencyScreen} />
          <Tab.Screen name="Fees" component={FeesScreen} />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ConvexProvider>
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
});
