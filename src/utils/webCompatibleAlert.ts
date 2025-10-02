import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

/**
 * Web-compatible alert function that uses browser's native confirm/alert
 * on web platforms and React Native Alert on mobile platforms
 */
export const webCompatibleAlert = (options: AlertOptions) => {
  const { title, message, buttons = [] } = options;

  if (Platform.OS === 'web') {
    // For web, use browser's native dialogs
    if (buttons.length === 0) {
      // Simple alert
      (window as any).alert(`${title}\n\n${message}`);
    } else if (buttons.length === 1) {
      // Single button - just show alert
      (window as any).alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
    } else if (buttons.length === 2) {
      // Two buttons - use confirm dialog
      const confirmed = (window as any).confirm(`${title}\n\n${message}`);
      if (confirmed) {
        // Find the non-cancel button and execute its onPress
        const actionButton = buttons.find(btn => btn.style !== 'cancel');
        actionButton?.onPress?.();
      } else {
        // Find the cancel button and execute its onPress
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        cancelButton?.onPress?.();
      }
    } else {
      // More than 2 buttons - fallback to simple alert
      (window as any).alert(`${title}\n\n${message}`);
    }
  } else {
    // For mobile, use React Native Alert
    Alert.alert(title, message, buttons);
  }
};

/**
 * Simple alert for web compatibility
 */
export const simpleAlert = (message: string, title: string = 'Alert') => {
  webCompatibleAlert({ title, message });
};

/**
 * Confirmation dialog for web compatibility
 */
export const confirmAlert = (
  message: string, 
  title: string = 'Confirm',
  onConfirm?: () => void,
  onCancel?: () => void
) => {
  webCompatibleAlert({
    title,
    message,
    buttons: [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm }
    ]
  });
};
