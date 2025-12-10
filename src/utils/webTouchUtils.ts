import { Platform } from 'react-native';

/**
 * Web-specific touch event utilities
 * Fixes touch event handling issues on web platforms
 */

/**
 * Check if we're running on web platform
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Web-compatible touch event handler
 * Prevents touch event errors on web by ensuring proper event sequencing
 */
export const createWebTouchHandler = (
  onPress: () => void,
  options: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
) => {
  if (!isWeb()) {
    return onPress;
  }

  return (event?: any) => {
    try {
      // Prevent default browser behavior if specified
      if (options.preventDefault && event?.preventDefault) {
        event.preventDefault();
      }

      // Stop event propagation if specified
      if (options.stopPropagation && event?.stopPropagation) {
        event.stopPropagation();
      }

      // Call the original handler
      onPress();
    } catch (error) {
      console.warn('Web touch handler error:', error);
      // Fallback: call the handler anyway
      onPress();
    }
  };
};

/**
 * Web-compatible pressable configuration
 * Provides consistent behavior across web and mobile
 */
export const getWebPressableConfig = () => {
  return {
    // Web-specific props
    ...(isWeb() && {
      onMouseDown: undefined, // Prevent mouse down conflicts
      onMouseUp: undefined,   // Prevent mouse up conflicts
    }),
  };
};
