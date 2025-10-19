import { Platform } from 'react-native';

/**
 * Utility functions for platform-specific animations
 */

/**
 * Get the appropriate useNativeDriver value based on platform
 * On web, native driver is not supported, so we use false
 * On mobile platforms, we can use true for better performance
 */
export const getUseNativeDriver = (): boolean => {
  return Platform.OS !== 'web';
};

/**
 * Get animation configuration optimized for the current platform
 */
export const getAnimationConfig = (baseConfig: any) => {
  return {
    ...baseConfig,
    useNativeDriver: getUseNativeDriver(),
  };
};

/**
 * Platform-specific animation durations
 * Web animations can be slightly slower due to JS-based rendering
 */
export const getAnimationDuration = (mobileDuration: number): number => {
  return Platform.OS === 'web' ? mobileDuration * 1.2 : mobileDuration;
};

/**
 * Platform-specific spring configurations
 * Web springs may need different tension/friction values
 */
export const getSpringConfig = (baseConfig: { tension?: number; friction?: number }) => {
  if (Platform.OS === 'web') {
    return {
      ...baseConfig,
      tension: (baseConfig.tension || 100) * 0.8, // Slightly less tension on web
      friction: (baseConfig.friction || 8) * 1.1, // Slightly more friction on web
    };
  }
  return baseConfig;
};
