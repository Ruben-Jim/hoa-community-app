import React, { useMemo, useEffect, useState } from 'react';
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
import ErrorBoundary from './src/components/ErrorBoundary';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';

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

// Environment variable validation component
const EnvironmentErrorScreen = () => (
  <View style={styles.setupContainer}>
    <Text style={styles.setupTitle}>Configuration Error</Text>
    <Text style={styles.setupText}>
      The app is missing required configuration. Please ensure EXPO_PUBLIC_CONVEX_URL is set.
    </Text>
    <Text style={styles.setupText}>
      For production builds, set this as an EAS secret:
    </Text>
    <Text style={styles.setupCode}>
      eas secret:create --scope project --name EXPO_PUBLIC_CONVEX_URL --value {'<your-convex-url>'}
    </Text>
  </View>
);

export default function App() {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  const [notificationInitAttempted, setNotificationInitAttempted] = useState(false);
  // Only show splash screen on iOS and Android, not on web
  const [showSplash, setShowSplash] = useState(Platform.OS !== 'web');
  
  // Persistent navigation state
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState<any>();

  // Validate environment variables
  const hasRequiredEnvVars = !!convexUrl;

  const convex = useMemo(() => {
    if (!convexUrl) return null;
    try {
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error('Failed to create Convex client:', error);
      return null;
    }
  }, [convexUrl]);

  // Initialize notifications when app starts (non-blocking)
  useEffect(() => {
    let isMounted = true;
    
    const initializeNotifications = async () => {
      // Don't block app startup - initialize in background
      setNotificationInitAttempted(true);
      
      try {
        // Add a small delay to not interfere with app startup
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        
        await enhancedUnifiedNotificationManager.initialize();
        console.log('Notifications initialized successfully');
      } catch (error) {
        // Log but don't crash - notifications are not critical for app startup
        console.error('Failed to initialize notifications (non-critical):', error);
      }
    };

    // Initialize notifications asynchronously without blocking
    initializeNotifications().catch(err => {
      console.error('Notification initialization error:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Show animated splash screen first (only on iOS and Android)
  // This must be after all hooks are called
  if (showSplash && Platform.OS !== 'web') {
    return (
      <AnimatedSplashScreen
        videoSource={require('./assets/splash-icon.mp4')}
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // Show error screen if required environment variables are missing
  if (!hasRequiredEnvVars) {
    return (
      <SafeAreaProvider>
        <ErrorBoundary>
          <EnvironmentErrorScreen />
        </ErrorBoundary>
      </SafeAreaProvider>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Ensure ConvexProvider wraps AuthProvider (required for Convex hooks)
  const content = (
    <SafeAreaProvider>
      {convex ? (
        <ConvexProvider client={convex}>
          <AuthProvider>
            <MessagingProvider>
              <NavigationContainer initialState={initialState} onStateChange={onStateChange}>
                <MainAppContent />
                <StatusBar style="auto" />
              </NavigationContainer>
            </MessagingProvider>
          </AuthProvider>
        </ConvexProvider>
      ) : (
        <AuthProvider>
          <MessagingProvider>
            <NavigationContainer initialState={initialState} onStateChange={onStateChange}>
              <MainAppContent />
              <StatusBar style="auto" />
            </NavigationContainer>
          </MessagingProvider>
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );

  return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
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