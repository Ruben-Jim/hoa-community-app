import { useState } from 'react';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
  });

  const showAlert = (options: AlertOptions) => {
    const { title, message, buttons = [], type = 'info' } = options;
    setAlertState({
      visible: true,
      title,
      message,
      buttons,
      type,
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return {
    alertState,
    showAlert,
    hideAlert,
  };
};
