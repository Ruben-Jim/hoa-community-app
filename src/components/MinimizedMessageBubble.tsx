import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMessaging } from '../context/MessagingContext';

interface MinimizedMessageBubbleProps {
  onPress: () => void;
}

const MinimizedMessageBubble: React.FC<MinimizedMessageBubbleProps> = ({ onPress }) => {
  const { hasUnreadMessages, latestMessagePreview, conversations } = useMessaging();
  const insets = useSafeAreaInsets();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const screenWidth = Dimensions.get('window').width;

  React.useEffect(() => {
    if (hasUnreadMessages) {
      // Pulse animation when new message arrives
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasUnreadMessages, latestMessagePreview]);

  if (!hasUnreadMessages || conversations.length === 0) {
    return null;
  }

  const latestConv = conversations[0];
  const preview = latestMessagePreview || 'New message from Shelton Springs Board';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) + 60 : 80,
          right: 16,
          transform: [{ scale: scaleAnim }],
          maxWidth: screenWidth < 400 ? screenWidth - 32 : 320,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.bubble}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#2563eb" />
        </View>
        <View style={styles.content}>
          <Text style={styles.fromText}>From: Shelton Springs Board</Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {preview}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
    }),
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      userSelect: 'none' as any,
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  fromText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  previewText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default MinimizedMessageBubble;

