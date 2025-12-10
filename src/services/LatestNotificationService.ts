import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Latest iOS 18+ and Android 15+ notification configuration
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { data } = notification.request.content;
    
    // iOS 18+ Priority Notifications - AI-driven priority detection
    const isHighPriority = data?.priority === 'high' || data?.type === 'emergency';
    const isTimeSensitive = data?.timeSensitive === true;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
        // iOS 18+ specific features
        ...(Platform.OS === 'ios' && {
          // Enable notification summaries for grouped notifications
          categoryIdentifier: data?.category || 'default',
          // Support for Announce Notifications
          sound: isHighPriority ? 'default' : false,
        }),
    };
  },
});

export interface LatestNotificationData {
  title: string;
  body: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
  sound?: boolean;
  vibrate?: boolean;
  badge?: number;
  channelId?: string; // Android specific
  timeSensitive?: boolean; // iOS 18+ feature
  interruptionLevel?: 'passive' | 'active' | 'timeSensitive' | 'critical'; // iOS 18+
  relevanceScore?: number; // iOS 18+ AI relevance scoring
  threadIdentifier?: string; // iOS 18+ notification grouping
}

export interface LatestNotificationSettings {
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
}

class LatestNotificationService {
  private static instance: LatestNotificationService;
  private isInitialized = false;
  private permissionStatus: Notifications.PermissionStatus | null = null;
  private pushToken: string | null = null;
  private notificationSettings: LatestNotificationSettings | null = null;
  private retryAttempts = 0;
  private maxRetries = 3;

  private constructor() {}

  public static getInstance(): LatestNotificationService {
    if (!LatestNotificationService.instance) {
      LatestNotificationService.instance = new LatestNotificationService();
    }
    return LatestNotificationService.instance;
  }

  /**
   * Initialize the latest notification service with iOS 18+ and Android 15+ features
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Request permissions with latest iOS 18+ and Android 15+ options
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            // allowAnnouncements: true, // iOS 18+ Announce Notifications - not available in current Expo version
            allowCriticalAlerts: true, // iOS 18+ Critical Alerts
            provideAppNotificationSettings: true, // iOS 18+ App Notification Settings
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowVibrate: true,
            allowLights: true,
            allowShowTimestamp: true,
            // Android 15+ specific permissions
            allowBubble: true, // Android 15+ Notification Bubbles
            allowFullScreenIntent: true, // Android 15+ Full Screen Intents
          },
        });
        finalStatus = status;
      }

      this.permissionStatus = finalStatus;
      this.isInitialized = true;

      // Configure latest notification categories with iOS 18+ and Android 15+ features
      await this.configureLatestNotificationCategories();

      // Get push token for remote notifications
      if (finalStatus === 'granted') {
        await this.getPushToken();
      }

      console.log('LatestNotificationService initialized with status:', finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Failed to initialize LatestNotificationService:', error);
      return false;
    }
  }

  /**
   * Load notification settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('latestNotificationSettings');
      if (savedSettings) {
        this.notificationSettings = JSON.parse(savedSettings);
      } else {
        // Default settings with latest features
        this.notificationSettings = {
          emergency: true,
          alerts: true,
          info: true,
          sound: true,
          vibrate: true,
          badge: true,
          // iOS 18+ specific settings
          announceNotifications: true,
          notificationSummaries: true,
          focusModeCompatible: true,
          // Android 15+ specific settings
          adaptiveNotifications: true,
          smartReplies: true,
        };
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      this.notificationSettings = {
        emergency: true,
        alerts: true,
        info: true,
        sound: true,
        vibrate: true,
        badge: true,
        announceNotifications: true,
        notificationSummaries: true,
        focusModeCompatible: true,
        adaptiveNotifications: true,
        smartReplies: true,
      };
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      if (this.notificationSettings) {
        await AsyncStorage.setItem('latestNotificationSettings', JSON.stringify(this.notificationSettings));
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Get push token for remote notifications
   */
  private async getPushToken(): Promise<void> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'a30576d8-ca43-4d96-8957-d6080ae9076d',
      });
      this.pushToken = token.data;
      console.log('Push token obtained:', this.pushToken);
    } catch (error) {
      console.error('Failed to get push token:', error);
    }
  }

  /**
   * Configure latest notification categories with iOS 18+ and Android 15+ features
   */
  private async configureLatestNotificationCategories(): Promise<void> {
    try {
      // Emergency category with iOS 18+ critical alerts
      await Notifications.setNotificationCategoryAsync('emergency', [
        {
          identifier: 'view_action',
          buttonTitle: 'View Alert',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'dismiss_action',
          buttonTitle: 'Dismiss',
          options: {
            opensAppToForeground: false,
          },
        },
        // iOS 18+ smart replies
        ...(Platform.OS === 'ios' ? [
          {
            identifier: 'acknowledge_action',
            buttonTitle: 'Acknowledge',
            options: {
              opensAppToForeground: false,
            },
          },
        ] : []),
      ], {
        // iOS 18+ specific options
        ...(Platform.OS === 'ios' && {
          intentIdentifiers: ['emergency_alert'],
          // Enable notification summaries
          categorySummaryFormat: '%u more emergency alerts',
          // Support for critical alerts
          allowInCarPlay: true,
          allowInForeground: true,
        }),
      });

      // Alert category with Android 15+ adaptive notifications
      await Notifications.setNotificationCategoryAsync('alert', [
        {
          identifier: 'view_action',
          buttonTitle: 'View Alert',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'dismiss_action',
          buttonTitle: 'Dismiss',
          options: {
            opensAppToForeground: false,
          },
        },
        // Android 15+ smart replies
        ...(Platform.OS === 'android' ? [
          {
            identifier: 'reply_action',
            buttonTitle: 'Reply',
            options: {
              opensAppToForeground: false,
            },
          },
        ] : []),
      ], {
        // Android 15+ specific options
        ...(Platform.OS === 'android' && {
          intentIdentifiers: ['community_alert'],
          // Enable adaptive notifications
          allowBubble: true,
          allowFullScreenIntent: false,
        }),
      });

      // Info category with notification summaries
      await Notifications.setNotificationCategoryAsync('info', [
        {
          identifier: 'view_action',
          buttonTitle: 'View Info',
          options: {
            opensAppToForeground: true,
          },
        },
      ], {
        // iOS 18+ notification summaries
        ...(Platform.OS === 'ios' && {
          intentIdentifiers: ['community_info'],
          categorySummaryFormat: '%u more updates',
          // Enable for notification summaries
          allowInCarPlay: false,
          allowInForeground: true,
        }),
      });
    } catch (error) {
      console.error('Failed to configure latest notification categories:', error);
    }
  }

  /**
   * Send a notification with latest iOS 18+ and Android 15+ features
   */
  public async sendLatestNotification(
    notificationData: LatestNotificationData,
    retryCount = 0
  ): Promise<string | null> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled, cannot send notification');
      return null;
    }

    // Check if user has enabled this type of notification
    if (!this.shouldSendNotification(notificationData.data?.type)) {
      console.log('Notification type disabled by user settings');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          categoryIdentifier: notificationData.category || 'info',
          priority: notificationData.priority || 'normal',
          sound: this.notificationSettings?.sound ? notificationData.sound !== false : false,
          vibrate: this.notificationSettings?.vibrate ? (notificationData.vibrate !== false ? [0, 250, 250, 250] : []) : [],
          badge: this.notificationSettings?.badge ? notificationData.badge : undefined,
          // iOS 18+ specific features
          ...(Platform.OS === 'ios' && {
            interruptionLevel: notificationData.interruptionLevel || this.getInterruptionLevel(notificationData.data?.type),
            relevanceScore: notificationData.relevanceScore || this.getRelevanceScore(notificationData.data?.type),
            threadIdentifier: notificationData.threadIdentifier || notificationData.data?.type,
            // Support for Announce Notifications
            sound: this.notificationSettings?.announceNotifications ? notificationData.sound !== false : false,
          }),
          // Android 15+ specific features
          ...(Platform.OS === 'android' && notificationData.channelId && {
            channelId: notificationData.channelId,
            // Android 15+ adaptive notifications
            adaptive: this.notificationSettings?.adaptiveNotifications || false,
            // Smart replies support
            actions: this.getSmartReplies(notificationData.data?.type),
          }),
        },
        trigger: null, // Show immediately
      });

      console.log('Latest notification sent with ID:', notificationId);
      this.retryAttempts = 0; // Reset retry counter on success
      return notificationId;
    } catch (error) {
      console.error('Failed to send latest notification:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying notification in ${delay}ms (attempt ${retryCount + 1})`);
        
        setTimeout(() => {
          this.sendLatestNotification(notificationData, retryCount + 1);
        }, delay);
      }
      
      return null;
    }
  }

  /**
   * Get interruption level based on notification type (iOS 18+)
   */
  private getInterruptionLevel(type?: string): 'passive' | 'active' | 'timeSensitive' | 'critical' {
    switch (type) {
      case 'emergency':
        return 'critical';
      case 'alert':
        return 'timeSensitive';
      case 'info':
        return 'passive';
      default:
        return 'active';
    }
  }

  /**
   * Get relevance score for AI-driven notification sorting (iOS 18+)
   */
  private getRelevanceScore(type?: string): number {
    switch (type) {
      case 'emergency':
        return 1.0; // Highest relevance
      case 'alert':
        return 0.7; // High relevance
      case 'info':
        return 0.3; // Low relevance
      default:
        return 0.5; // Medium relevance
    }
  }

  /**
   * Get smart replies for Android 15+
   */
  private getSmartReplies(type?: string): any[] {
    if (!this.notificationSettings?.smartReplies) return [];
    
    switch (type) {
      case 'emergency':
        return [
          { action: 'acknowledge', title: 'Acknowledge' },
          { action: 'view_details', title: 'View Details' },
        ];
      case 'alert':
        return [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' },
        ];
      default:
        return [];
    }
  }

  /**
   * Check if notification should be sent based on user settings
   */
  private shouldSendNotification(type?: string): boolean {
    if (!this.notificationSettings) return true;
    
    switch (type) {
      case 'emergency':
        // Emergency notifications are always enabled for safety
        return true;
      case 'alert':
        return this.notificationSettings.alerts;
      case 'info':
        return this.notificationSettings.info;
      default:
        return true;
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
    const priorityMap = {
      High: 'high' as const,
      Medium: 'normal' as const,
      Low: 'low' as const,
    };

    return this.sendLatestNotification({
      title: `🚨 ${title}`,
      body: content,
      priority: priorityMap[priority],
      category: 'emergency',
      sound: true,
      vibrate: true,
      timeSensitive: priority === 'High',
      interruptionLevel: 'critical',
      relevanceScore: 1.0,
      data: {
        type: 'emergency',
        priority,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Send regular alert with latest features
   */
  public async sendAlert(
    title: string,
    content: string,
    priority: 'High' | 'Medium' | 'Low' = 'Medium'
  ): Promise<string | null> {
    const priorityMap = {
      High: 'high' as const,
      Medium: 'normal' as const,
      Low: 'low' as const,
    };

    return this.sendLatestNotification({
      title: `⚠️ ${title}`,
      body: content,
      priority: priorityMap[priority],
      category: 'alert',
      sound: priority === 'High',
      vibrate: priority === 'High',
      timeSensitive: priority === 'High',
      interruptionLevel: priority === 'High' ? 'timeSensitive' : 'active',
      relevanceScore: priority === 'High' ? 0.8 : 0.6,
      data: {
        type: 'alert',
        priority,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Send info notification with latest features
   */
  public async sendInfo(
    title: string,
    content: string
  ): Promise<string | null> {
    return this.sendLatestNotification({
      title: `ℹ️ ${title}`,
      body: content,
      priority: 'normal',
      category: 'info',
      sound: false,
      vibrate: false,
      timeSensitive: false,
      interruptionLevel: 'passive',
      relevanceScore: 0.3,
      data: {
        type: 'info',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Check if notifications are enabled
   */
  public isEnabled(): boolean {
    return this.permissionStatus === 'granted';
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): Notifications.PermissionStatus | null {
    return this.permissionStatus;
  }

  /**
   * Get push token (for server-side notifications)
   */
  public getPushTokenValue(): string | null {
    return this.pushToken;
  }

  /**
   * Get notification settings
   */
  public getSettings(): LatestNotificationSettings | null {
    return this.notificationSettings;
  }

  /**
   * Update notification settings
   */
  public async updateSettings(settings: Partial<LatestNotificationSettings>): Promise<void> {
    if (this.notificationSettings) {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      await this.saveSettings();
    }
  }

  /**
   * Request notification permissions with latest iOS 18+ and Android 15+ options
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          // allowAnnouncements: true, // iOS 18+ Announce Notifications - not available in current Expo version
          allowCriticalAlerts: true, // iOS 18+ Critical Alerts
          provideAppNotificationSettings: true, // iOS 18+ App Notification Settings
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowVibrate: true,
          allowLights: true,
          allowShowTimestamp: true,
          allowBubble: true, // Android 15+ Notification Bubbles
          allowFullScreenIntent: true, // Android 15+ Full Screen Intents
        },
      });
      
      this.permissionStatus = status;
      
      if (status === 'granted') {
        await this.getPushToken();
      }
      
      return status === 'granted';
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
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  public addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Handle notification received (when app is in foreground)
   */
  public addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Get comprehensive notification statistics with latest features
   */
  public async getNotificationStats(): Promise<{
    enabled: boolean;
    platform: string;
    permissionStatus: string;
    pushToken: string | null;
    scheduledCount: number;
    settings: LatestNotificationSettings | null;
    features: {
      ios18Features: boolean;
      android15Features: boolean;
      announceNotifications: boolean;
      notificationSummaries: boolean;
      adaptiveNotifications: boolean;
      smartReplies: boolean;
    };
  }> {
    const scheduled = await this.getScheduledNotifications();
    
    return {
      enabled: this.isEnabled(),
      platform: Platform.OS,
      permissionStatus: this.permissionStatus || 'unknown',
      pushToken: this.pushToken,
      scheduledCount: scheduled.length,
      settings: this.notificationSettings,
      features: {
        ios18Features: Platform.OS === 'ios',
        android15Features: Platform.OS === 'android',
        announceNotifications: this.notificationSettings?.announceNotifications || false,
        notificationSummaries: this.notificationSettings?.notificationSummaries || false,
        adaptiveNotifications: this.notificationSettings?.adaptiveNotifications || false,
        smartReplies: this.notificationSettings?.smartReplies || false,
      },
    };
  }
}

// Export singleton instance
export const latestNotificationService = LatestNotificationService.getInstance();
export default latestNotificationService;
