import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import enhancedUnifiedNotificationManager from '../services/EnhancedUnifiedNotificationManager';

export interface NotificationState {
  isEnabled: boolean;
  permissionStatus: string;
  isInitialized: boolean;
  isLoading: boolean;
}

export interface NotificationActions {
  requestPermissions: () => Promise<boolean>;
  sendEmergencyAlert: (title: string, content: string, priority?: 'High' | 'Medium' | 'Low') => Promise<string | null>;
  sendAlert: (title: string, content: string, priority?: 'High' | 'Medium' | 'Low') => Promise<string | null>;
  sendInfo: (title: string, content: string) => Promise<string | null>;
  sendNotification: (title: string, body: string, priority?: 'High' | 'Medium' | 'Low', type?: 'Emergency' | 'Alert' | 'Info') => Promise<string | null>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useNotifications = (): NotificationState & NotificationActions => {
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    permissionStatus: 'default',
    isInitialized: false,
    isLoading: true,
  });

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const success = await enhancedUnifiedNotificationManager.initialize();
      
      setState(prev => ({
        ...prev,
        isInitialized: success,
        isEnabled: enhancedUnifiedNotificationManager.isEnabled(),
        permissionStatus: enhancedUnifiedNotificationManager.getPermissionStatus(),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setState(prev => ({
        ...prev,
        isInitialized: false,
        isEnabled: false,
        isLoading: false,
      }));
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await enhancedUnifiedNotificationManager.requestPermissions();
      
      setState(prev => ({
        ...prev,
        isEnabled: granted,
        permissionStatus: enhancedUnifiedNotificationManager.getPermissionStatus(),
      }));
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  const sendEmergencyAlert = useCallback(async (
    title: string,
    content: string,
    priority: 'High' | 'Medium' | 'Low' = 'High'
  ): Promise<string | null> => {
    try {
      return await enhancedUnifiedNotificationManager.sendEmergencyAlert(title, content, priority);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return null;
    }
  }, []);

  const sendAlert = useCallback(async (
    title: string,
    content: string,
    priority: 'High' | 'Medium' | 'Low' = 'Medium'
  ): Promise<string | null> => {
    try {
      return await enhancedUnifiedNotificationManager.sendAlert(title, content, priority);
    } catch (error) {
      console.error('Failed to send alert:', error);
      return null;
    }
  }, []);

  const sendInfo = useCallback(async (
    title: string,
    content: string
  ): Promise<string | null> => {
    try {
      return await enhancedUnifiedNotificationManager.sendInfo(title, content);
    } catch (error) {
      console.error('Failed to send info notification:', error);
      return null;
    }
  }, []);

  const sendNotification = useCallback(async (
    title: string,
    body: string,
    priority: 'High' | 'Medium' | 'Low' = 'Medium',
    type: 'Emergency' | 'Alert' | 'Info' = 'Info'
  ): Promise<string | null> => {
    try {
      return await enhancedUnifiedNotificationManager.sendNotification({
        title,
        body,
        priority,
        type,
        data: {
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, []);

  const cancelNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await enhancedUnifiedNotificationManager.cancelNotification(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await enhancedUnifiedNotificationManager.cancelAllNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }, []);

  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        isEnabled: enhancedUnifiedNotificationManager.isEnabled(),
        permissionStatus: enhancedUnifiedNotificationManager.getPermissionStatus(),
      }));
    } catch (error) {
      console.error('Failed to refresh notification status:', error);
    }
  }, []);

  return {
    ...state,
    requestPermissions,
    sendEmergencyAlert,
    sendAlert,
    sendInfo,
    sendNotification,
    cancelNotification,
    cancelAllNotifications,
    refreshStatus,
  };
};

export default useNotifications;
