import React, { useMemo, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MessagingProvider, useMessaging } from './src/context/MessagingContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import enhancedUnifiedNotificationManager from './src/services/EnhancedUnifiedNotificationManager';
import MessagingOverlay from './src/components/MessagingOverlay';
import MinimizedMessageBubble from './src/components/MinimizedMessageBubble';

import HomeScreen from './src/screens/HomeScreen';
import BoardScreen from './src/screens/BoardScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import CovenantsScreen from './src/screens/CovenantsScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import FeesScreen from './src/screens/FeesScreen';
import BlockedAccountScreen from './src/screens/BlockedAccountScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createStackNavigator();

const MainAppContent = () => {
  const { isAuthenticated, isLoading, isUserBlocked, user } = useAuth();
  const { showOverlay, setShowOverlay } = useMessaging();

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
  const isDev = user?.isDev ?? false;

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Board" component={BoardScreen} />
        <Stack.Screen name="Covenants" component={CovenantsScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="Fees" component={FeesScreen} />
        {(isBoardMember || isDev) && (
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen}
          />
        )}
      </Stack.Navigator>
      <MessagingOverlay
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
      />
      <MinimizedMessageBubble
        onPress={() => setShowOverlay(true)}
      />
    </>
  );
};

export default function App() {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  // Initialize notifications when app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await enhancedUnifiedNotificationManager.initialize();
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Persistent navigation state
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState<any>();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedState = localStorage.getItem('navState');
          if (savedState !== null) {
            setInitialState(JSON.parse(savedState));
          }
        }
      } catch (e) {
        console.error('Error restoring navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  const onStateChange = (state: any) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('navState', JSON.stringify(state));
    }
  };

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const content = (
    <SafeAreaProvider>
      <AuthProvider>
        <MessagingProvider>
          <NavigationContainer initialState={initialState} onStateChange={onStateChange}>
            <MainAppContent />
            <StatusBar style="auto" />
          </NavigationContainer>
        </MessagingProvider>
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