import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMessaging } from '../context/MessagingContext';

interface MessagingButtonProps {
  onPress: () => void;
  style?: any;
}

const MessagingButton: React.FC<MessagingButtonProps> = ({ onPress, style }) => {
  const { conversations } = useMessaging();
  const unreadCount = conversations.length; // For now, show conversation count

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubbles" size={20} color="#2563eb" />
      {unreadCount > 0 && (
        <Text style={styles.badge}>{unreadCount}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      userSelect: 'none' as any,
    }),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
    overflow: 'hidden',
  },
});

export default MessagingButton;

