import React from 'react';
import { View, Text } from 'react-native';
import { useWebFonts } from '../hooks/useWebFonts';

interface FontLoaderProps {
  children: React.ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  const { fontsLoaded, fontError } = useWebFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Loading fonts...</Text>
      </View>
    );
  }

  if (fontError) {
    console.warn('Font loading error:', fontError);
  }

  return <>{children}</>;
};

export default FontLoader;
