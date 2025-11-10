import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';

interface ProfileImageProps {
  source: string | null | undefined;
  size?: number;
  style?: any;
  initials?: string;
}

const ProfileImage = ({ source, size = 40, style, initials }: ProfileImageProps) => {
  const radiusStyle = { width: size, height: size, borderRadius: size / 2 };
  const placeholder = (
    <View style={[styles.placeholder, radiusStyle, style]}>
      {initials ? (
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color="#6b7280" />
      )}
    </View>
  );

  if (!source) {
    return placeholder;
  }

  return (
    <OptimizedImage
      source={source}
      fallback={placeholder}
      containerStyle={[radiusStyle, style]}
      style={[styles.image, radiusStyle]}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
  },
  initials: {
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default ProfileImage;
