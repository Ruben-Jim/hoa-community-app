import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export const useWebFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      // Only load fonts on web platform
      if (Platform.OS !== 'web') {
        setFontsLoaded(true);
        return;
      }

      try {
        // Load Ionicons font for web
        await Font.loadAsync({
          ...Ionicons.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontError('Failed to load fonts');
        // Still set as loaded to prevent infinite loading
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
};
