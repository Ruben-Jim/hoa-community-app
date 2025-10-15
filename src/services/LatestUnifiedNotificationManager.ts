import { Platform } from 'react-native';
import latestNotificationService, { LatestNotificationData, LatestNotificationSettings } from './LatestNotificationService';
import latestWebNotificationService, { LatestWebNotificationData, LatestWebNotificationSettings } from './LatestWebNotificationService';

// Unified interface for latest iOS 18+ and Android 15+ notifications
export interface LatestUnifiedNotificationSettings {
  emergency: boolean;
  alerts: boolean;
  info: boolean;
  sound: boolean;
  vibrate: boolean;
  badge: boolean;
  // iOS 18+ specific settings
  announceNotifications: boolean;
  notificationSummaries: boolean;
  focusModeCompatible: boolean;
  // Android 15+ specific settings
  adaptiveNotifications: boolean;
  smartReplies: boolean;
  bubbleNotifications: boolean;
  fullScreenIntents: boolean;
}

export interface LatestUnifiedNotificationData {
  title: string;
  body: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
  sound?: boolean;
  vibrate?: boolean;
  badge?: number;
  // iOS 18+ specific features
  timeSensitive?: boolean;
  interruptionLevel?: 'passive' | 'active' | 'timeSensitive' | 'critical';
  relevanceScore?: number;
  threadIdentifier?: string;
  // Android 15+ specific features
  adaptive?: boolean;
  bubble?: boolean;
  fullScreenIntent?: boolean;
}

class LatestUnifiedNotificationManager {
  private static instance: LatestUnifiedNotificationManager;
  private isInitialized = false;
  private mobileEnabled = false;
  private webEnabled = false;

  private constructor() {}

  public static getInstance(): LatestUnifiedNotificationManager {
    if (!LatestUnifiedNotificationManager.instance) {
      LatestUnifiedNotificationManager.instance = new LatestUnifiedNotificationManager();
    }
    return LatestUnifiedNotificationManager.instance;
  }

  /**
   * Initialize the latest unified notification manager with iOS 18+ and Android 15+ features
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isEnabled();
    }

    try {
      console.log('Initializing LatestUnifiedNotificationManager...');

      // Initialize mobile notifications (iOS/Android)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        this.mobileEnabled = await latestNotificationService.initialize();
        console.log('Mobile notifications initialized:', this.mobileEnabled);
      }

      // Initialize web notifications (Desktop)
      if (Platform.OS === 'web') {
        this.webEnabled = await latestWebNotificationService.initialize();
        console.log('Web notifications initialized:', this.webEnabled);
      }

      this.isInitialized = true;

      console.log('LatestUnifiedNotificationManager initialized:', {
        mobileEnabled: this.mobileEnabled,
        webEnabled: this.webEnabled,
        platform: Platform.OS,
      });

      return this.isEnabled();
    } catch (error) {
      console.error('Failed to initialize LatestUnifiedNotificationManager:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled on the current platform
   */
  public isEnabled(): boolean {
    if (Platform.OS === 'web') {
      return this.webEnabled;
    }
    return this.mobileEnabled;
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): string {
    if (Platform.OS === 'web') {
      return latestWebNotificationService.getPermissionStatus();
    }
    return latestNotificationService.getPermissionStatus() || 'denied';
  }

  /**
   * Get push token for server-side notifications
   */
  public getPushTokenValue(): string | null {
    if (Platform.OS === 'web') {
      return null; // Web doesn't use push tokens in the same way
    }
    return latestNotificationService.getPushTokenValue();
  }

  /**
   * Get unified notification settings
   */
  public getSettings(): LatestUnifiedNotificationSettings | null {
    if (Platform.OS === 'web') {
      const webSettings = latestWebNotificationService.getSettings();
      if (!webSettings) return null;
      
      return {
        emergency: webSettings.emergency,
        alerts: webSettings.alerts,
        info: webSettings.info,
        sound: webSettings.sound,
        vibrate: webSettings.vibrate,
        badge: webSettings.badge,
        announceNotifications: webSettings.announceNotifications,
        notificationSummaries: webSettings.notificationSummaries,
        focusModeCompatible: webSettings.focusModeCompatible,
        adaptiveNotifications: webSettings.adaptiveNotifications,
        smartReplies: webSettings.smartReplies,
        bubbleNotifications: webSettings.bubbleNotifications,
        fullScreenIntents: webSettings.fullScreenIntents,
      };
    }

    const mobileSettings = latestNotificationService.getSettings();
    if (!mobileSettings) return null;
    
    return {
      emergency: mobileSettings.emergency,
      alerts: mobileSettings.alerts,
      info: mobileSettings.info,
      sound: mobileSettings.sound,
      vibrate: mobileSettings.vibrate,
      badge: mobileSettings.badge,
      announceNotifications: mobileSettings.announceNotifications,
      notificationSummaries: mobileSettings.notificationSummaries,
      focusModeCompatible: mobileSettings.focusModeCompatible,
      adaptiveNotifications: mobileSettings.adaptiveNotifications,
      smartReplies: mobileSettings.smartReplies,
      bubbleNotifications: false, // Not applicable to mobile
      fullScreenIntents: false, // Not applicable to mobile
    };
  }

  /**
   * Update unified notification settings
   */
  public async updateSettings(settings: Partial<LatestUnifiedNotificationSettings>): Promise<void> {
    if (Platform.OS === 'web') {
      const webSettings: Partial<LatestWebNotificationSettings> = {
        emergency: settings.emergency,
        alerts: settings.alerts,
        info: settings.info,
        sound: settings.sound,
        vibrate: settings.vibrate,
        badge: settings.badge,
        announceNotifications: settings.announceNotifications,
        notificationSummaries: settings.notificationSummaries,
        focusModeCompatible: settings.focusModeCompatible,
        adaptiveNotifications: settings.adaptiveNotifications,
        smartReplies: settings.smartReplies,
        bubbleNotifications: settings.bubbleNotifications,
        fullScreenIntents: settings.fullScreenIntents,
      };
      await latestWebNotificationService.updateSettings(webSettings);
    } else {
      const mobileSettings: Partial<LatestNotificationSettings> = {
        emergency: settings.emergency,
        alerts: settings.alerts,
        info: settings.info,
        sound: settings.sound,
        vibrate: settings.vibrate,
        badge: settings.badge,
        announceNotifications: settings.announceNotifications,
        notificationSummaries: settings.notificationSummaries,
        focusModeCompatible: settings.focusModeCompatible,
        adaptiveNotifications: settings.adaptiveNotifications,
        smartReplies: settings.smartReplies,
      };
      await latestNotificationService.updateSettings(mobileSettings);
    }
  }

  /**
   * Send a unified notification with latest iOS 18+ and Android 15+ features
   */
  public async sendNotification(notificationData: LatestUnifiedNotificationData): Promise<string | null> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled, cannot send notification');
      return null;
    }

    try {
      if (Platform.OS === 'web') {
        const webNotificationData: LatestWebNotificationData = {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          tag: notificationData.category,
          requireInteraction: notificationData.priority === 'high',
          silent: notificationData.priority === 'low',
          interruptionLevel: notificationData.interruptionLevel,
          relevanceScore: notificationData.relevanceScore,
          threadIdentifier: notificationData.threadIdentifier,
          adaptive: notificationData.adaptive,
          bubble: notificationData.bubble,
          fullScreenIntent: notificationData.fullScreenIntent,
        };
        return await latestWebNotificationService.sendLatestNotification(webNotificationData);
      } else {
        const mobileNotificationData: LatestNotificationData = {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          priority: notificationData.priority,
          category: notificationData.category,
          sound: notificationData.sound,
          vibrate: notificationData.vibrate,
          badge: notificationData.badge,
          timeSensitive: notificationData.timeSensitive,
          interruptionLevel: notificationData.interruptionLevel,
          relevanceScore: notificationData.relevanceScore,
          threadIdentifier: notificationData.threadIdentifier,
        };
        return await latestNotificationService.sendLatestNotification(mobileNotificationData);
      }
    } catch (error) {
      console.error('Failed to send unified notification:', error);
      return null;
    }
  }

  /**
   * Send emergency alert with latest features
   */
  public async sendEmergencyAlert(
    title: string,
    content: string,
    priority: 'High' | 'Medium' | 'Low' = 'High'
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await latestWebNotificationService.sendEmergencyAlert(title, content, priority);
    } else {
      return await latestNotificationService.sendEmergencyAlert(title, content, priority);
    }
  }

  /**
   * Send regular alert with latest features
   */
  public async sendAlert(
    title: string,
    content: string,
    priority: 'High' | 'Medium' | 'Low' = 'Medium'
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await latestWebNotificationService.sendAlert(title, content, priority);
    } else {
      return await latestNotificationService.sendAlert(title, content, priority);
    }
  }

  /**
   * Send info notification with latest features
   */
  public async sendInfo(
    title: string,
    content: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await latestWebNotificationService.sendInfo(title, content);
    } else {
      return await latestNotificationService.sendInfo(title, content);
    }
  }

  /**
   * Request notification permissions with latest iOS 18+ and Android 15+ options
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await latestWebNotificationService.requestPermissions();
      } else {
        return await latestNotificationService.requestPermissions();
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Cancel a specific notification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        latestWebNotificationService.closeNotification(notificationId);
      } else {
        await latestNotificationService.cancelNotification(notificationId);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        latestWebNotificationService.closeAllNotifications();
      } else {
        await latestNotificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Set up notification event handlers with latest features
   */
  public setupNotificationHandlers(
    onNotificationReceived?: (notification: any) => void,
    onNotificationResponse?: (response: any) => void
  ): void {
    if (Platform.OS === 'web') {
      // Web event listeners are handled during initialization
      console.log('Web notification event listeners are handled during initialization');
    } else {
      // Mobile notification handlers
      if (onNotificationReceived) {
        latestNotificationService.addNotificationReceivedListener(onNotificationReceived);
      }
      if (onNotificationResponse) {
        latestNotificationService.addNotificationResponseListener(onNotificationResponse);
      }
    }
  }

  /**
   * Test the latest notification system with iOS 18+ and Android 15+ features
   */
  public async testNotificationSystem(): Promise<{
    success: boolean;
    platform: string;
    features: any;
    error?: string;
  }> {
    try {
      const testNotification: LatestUnifiedNotificationData = {
        title: '🧪 Latest Notification Test',
        body: 'Testing iOS 18+ and Android 15+ features',
        priority: 'high',
        category: 'test',
        sound: true,
        vibrate: true,
        timeSensitive: true,
        interruptionLevel: 'timeSensitive',
        relevanceScore: 0.9,
        threadIdentifier: 'test-notifications',
        adaptive: true,
        bubble: Platform.OS === 'web',
        data: {
          type: 'test',
          timestamp: Date.now(),
          features: {
            ios18Features: Platform.OS === 'ios',
            android15Features: Platform.OS === 'android',
            webFeatures: Platform.OS === 'web',
          },
        },
      };

      const notificationId = await this.sendNotification(testNotification);
      
      if (notificationId) {
        console.log('Latest notification test successful:', notificationId);
        return {
          success: true,
          platform: Platform.OS,
          features: this.getNotificationStats(),
        };
      } else {
        return {
          success: false,
          platform: Platform.OS,
          features: this.getNotificationStats(),
          error: 'Failed to send test notification',
        };
      }
    } catch (error) {
      console.error('Latest notification test failed:', error);
      return {
        success: false,
        platform: Platform.OS,
        features: this.getNotificationStats(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get comprehensive notification statistics with latest features
   */
  public async getNotificationStats(): Promise<{
    enabled: boolean;
    platform: string;
    permissionStatus: string;
    pushToken: string | null;
    settings: LatestUnifiedNotificationSettings | null;
    features: {
      ios18Features: boolean;
      android15Features: boolean;
      webFeatures: boolean;
      announceNotifications: boolean;
      notificationSummaries: boolean;
      adaptiveNotifications: boolean;
      smartReplies: boolean;
      bubbleNotifications: boolean;
      fullScreenIntents: boolean;
    };
    mobileStats?: any;
    webStats?: any;
  }> {
    const settings = this.getSettings();
    
    if (Platform.OS === 'web') {
      const webStats = latestWebNotificationService.getNotificationStats();
      return {
        enabled: this.isEnabled(),
        platform: Platform.OS,
        permissionStatus: this.getPermissionStatus(),
        pushToken: null,
        settings,
        features: {
          ios18Features: false,
          android15Features: false,
          webFeatures: true,
          announceNotifications: webStats.features.announceNotifications,
          notificationSummaries: webStats.features.notificationSummaries,
          adaptiveNotifications: webStats.features.adaptiveNotifications,
          smartReplies: webStats.features.smartReplies,
          bubbleNotifications: webStats.features.bubbleNotifications,
          fullScreenIntents: webStats.features.fullScreenIntents,
        },
        webStats,
      };
    } else {
      const mobileStats = await latestNotificationService.getNotificationStats();
      return {
        enabled: this.isEnabled(),
        platform: Platform.OS,
        permissionStatus: this.getPermissionStatus(),
        pushToken: this.getPushTokenValue(),
        settings,
        features: {
          ios18Features: Platform.OS === 'ios',
          android15Features: Platform.OS === 'android',
          webFeatures: false,
          announceNotifications: mobileStats.features.announceNotifications,
          notificationSummaries: mobileStats.features.notificationSummaries,
          adaptiveNotifications: mobileStats.features.adaptiveNotifications,
          smartReplies: mobileStats.features.smartReplies,
          bubbleNotifications: false,
          fullScreenIntents: false,
        },
        mobileStats,
      };
    }
  }
}

// Export singleton instance
export const latestUnifiedNotificationManager = LatestUnifiedNotificationManager.getInstance();
export default latestUnifiedNotificationManager;
