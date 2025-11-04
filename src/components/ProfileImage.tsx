import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ProfileImageProps {
  source: string | null | undefined;
  size?: number;
  style?: any;
  initials?: string;
}

const ProfileImage = ({ source, size = 40, style, initials }: ProfileImageProps) => {
  // Check if source is already a URL or needs conversion from storageId
  const isUrl = source?.startsWith('http') ?? false;
  const storageId = source && !isUrl ? source : null;
  
  const imageUrlFromStorage = useQuery(
    api.storage.getUrl,
    storageId ? { storageId: storageId as any } : "skip"
  );
  
  // Use URL directly if it's already a URL, otherwise use converted URL from storage
  const imageUrl = isUrl ? source : imageUrlFromStorage;
  
  if (!imageUrl) {
    return (
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
        {initials ? (
          <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        ) : (
          <Ionicons name="person" size={size * 0.5} color="#6b7280" />
        )}
      </View>
    );
  }
  
  return (
    <Image 
      source={{ uri: imageUrl }} 
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style]}
      resizeMode="cover"
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

