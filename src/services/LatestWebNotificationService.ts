import AsyncStorage from '@react-native-async-storage/async-storage';

// Latest Web Notifications API with iOS 18+ and Android 15+ features
export interface LatestWebNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  tag?: string; // For notification grouping
  requireInteraction?: boolean; // iOS 18+ persistent notifications
  silent?: boolean; // iOS 18+ silent notifications
  timestamp?: number;
  // iOS 18+ specific features
  interruptionLevel?: 'passive' | 'active' | 'timeSensitive' | 'critical';
  relevanceScore?: number; // AI-driven relevance scoring
  threadIdentifier?: string; // Notification grouping
  // Android 15+ specific features
  actions?: NotificationAction[]; // Smart replies and actions
  adaptive?: boolean; // Adaptive notifications
  bubble?: boolean; // Notification bubbles
  fullScreenIntent?: boolean; // Full screen intents
}

export interface LatestWebNotificationSettings {
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

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class LatestWebNotificationService {
  private static instance: LatestWebNotificationService;
  private isInitialized = false;
  private permissionStatus: NotificationPermission = 'default';
  private notificationSettings: LatestWebNotificationSettings | null = null;
  private retryAttempts = 0;
  private maxRetries = 3;
  private notificationQueue: LatestWebNotificationData[] = [];
  private isProcessingQueue = false;

  private constructor() {}

  public static getInstance(): LatestWebNotificationService {
    if (!LatestWebNotificationService.instance) {
      LatestWebNotificationService.instance = new LatestWebNotificationService();
    }
    return LatestWebNotificationService.instance;
  }

  /**
   * Initialize the latest web notification service with iOS 18+ and Android 15+ features
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Check if Web Notifications are supported
      if (!this.isWebNotificationsSupported()) {
        console.warn('Web Notifications not supported in this browser');
        return false;
      }

      // Check current permission status
      this.permissionStatus = Notification.permission;
      
      // Set up event listeners for latest features
      this.setupLatestEventListeners();
      
      this.isInitialized = true;
      console.log('LatestWebNotificationService initialized with status:', this.permissionStatus);
      return this.permissionStatus === 'granted';
    } catch (error) {
      console.error('Failed to initialize LatestWebNotificationService:', error);
      return false;
    }
  }

  /**
   * Check if Web Notifications are supported with latest features
   */
  public isWebNotificationsSupported(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      // iOS 18+ specific checks
      ('Notification' in window && 'permission' in Notification) &&
      // Android 15+ specific checks
      ('navigator' in window && 'userAgent' in navigator)
    );
  }

  /**
   * Load notification settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('latestWebNotificationSettings');
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
          bubbleNotifications: true,
          fullScreenIntents: false, // Usually disabled by default for security
        };
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to load web notification settings:', error);
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
        bubbleNotifications: true,
        fullScreenIntents: false,
      };
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      if (this.notificationSettings) {
        await AsyncStorage.setItem('latestWebNotificationSettings', JSON.stringify(this.notificationSettings));
      }
    } catch (error) {
      console.error('Failed to save web notification settings:', error);
    }
  }

  /**
   * Set up event listeners for latest iOS 18+ and Android 15+ features
   */
  private setupLatestEventListeners(): void {
    // Handle notification click with latest features
    self.addEventListener('notificationclick', (event: any) => {
      const notification = event.notification;
      const data = notification.data;
      
      console.log('Latest notification clicked:', data);
      
      // iOS 18+ specific handling
      if (data?.interruptionLevel === 'critical') {
        // Handle critical notifications differently
        console.log('Critical notification clicked');
      }
      
      // Android 15+ smart replies
      if (event.action && data?.smartReplies) {
        this.handleSmartReply(event.action, data);
        return;
      }
      
      // Default handling
      event.waitUntil(
        this.handleNotificationClick(notification, event.action)
      );
    });

    // Handle notification close with latest features
    self.addEventListener('notificationclose', (event: any) => {
      const notification = event.notification;
      const data = notification.data;
      
      console.log('Latest notification closed:', data);
      
      // iOS 18+ notification summaries
      if (data?.threadIdentifier && this.notificationSettings?.notificationSummaries) {
        this.updateNotificationSummary(data.threadIdentifier);
      }
    });

    // Handle notification show with latest features
    self.addEventListener('notificationshow', (event: any) => {
      const notification = event.notification;
      const data = notification.data;
      
      console.log('Latest notification shown:', data);
      
      // Track notification analytics
      this.trackNotificationShown(data);
    });

    // Handle focus mode changes (iOS 18+)
    if ('visibilityState' in document) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleAppFocus();
        } else {
          this.handleAppBlur();
        }
      });
    }
  }

  /**
   * Handle smart replies (Android 15+)
   */
  private handleSmartReply(action: string, data: any): void {
    console.log('Smart reply action:', action, data);
    
    // Send smart reply to server or handle locally
    switch (action) {
      case 'acknowledge':
        this.sendSmartReplyResponse('acknowledged', data);
        break;
      case 'dismiss':
        this.sendSmartReplyResponse('dismissed', data);
        break;
      case 'reply':
        this.sendSmartReplyResponse('replied', data);
        break;
      default:
        console.log('Unknown smart reply action:', action);
    }
  }

  /**
   * Send smart reply response
   */
  private sendSmartReplyResponse(response: string, data: any): void {
    // In a real app, you would send this to your server
    console.log('Smart reply response:', response, data);
  }

  /**
   * Handle notification click with latest features
   */
  private async handleNotificationClick(notification: Notification, action?: string): Promise<void> {
    const data = notification.data;
    
    // Close the notification
    notification.close();
    
    // iOS 18+ specific handling
    if (data?.interruptionLevel === 'critical') {
      // Critical notifications should open the app immediately
      await this.openAppToForeground();
    } else if (data?.threadIdentifier) {
      // Grouped notifications - open specific thread
      await this.openNotificationThread(data.threadIdentifier);
    } else {
      // Regular notification handling
      await this.openAppToForeground();
    }
  }

  /**
   * Open app to foreground (iOS 18+ and Android 15+)
   */
  private async openAppToForeground(): Promise<void> {
    try {
      // Try to focus the app window
      if ('clients' in self && self.clients) {
        const clients = await (self as any).clients.matchAll({ type: 'window' });
        if (clients.length > 0) {
          await clients[0].focus();
        }
      }
    } catch (error) {
      console.error('Failed to open app to foreground:', error);
    }
  }

  /**
   * Open specific notification thread (iOS 18+)
   */
  private async openNotificationThread(threadIdentifier: string): Promise<void> {
    try {
      // In a real app, you would navigate to the specific thread
      console.log('Opening notification thread:', threadIdentifier);
      await this.openAppToForeground();
    } catch (error) {
      console.error('Failed to open notification thread:', error);
    }
  }

  /**
   * Update notification summary (iOS 18+)
   */
  private updateNotificationSummary(threadIdentifier: string): void {
    // In a real app, you would update the notification summary
    console.log('Updating notification summary for thread:', threadIdentifier);
  }

  /**
   * Track notification shown analytics
   */
  private trackNotificationShown(data: any): void {
    // In a real app, you would send analytics data
    console.log('Notification shown analytics:', data);
  }

  /**
   * Handle app focus (iOS 18+ Focus Mode)
   */
  private handleAppFocus(): void {
    console.log('App focused - processing notification queue');
    this.processNotificationQueue();
  }

  /**
   * Handle app blur (iOS 18+ Focus Mode)
   */
  private handleAppBlur(): void {
    console.log('App blurred - notifications may be queued');
  }

  /**
   * Process queued notifications
   */
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        if (notification) {
          await this.sendLatestNotification(notification);
        }
      }
    } catch (error) {
      console.error('Failed to process notification queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Send a notification with latest iOS 18+ and Android 15+ features
   */
  public async sendLatestNotification(
    notificationData: LatestWebNotificationData,
    retryCount = 0
  ): Promise<string | null> {
    if (!this.isWebNotificationsSupported()) {
      console.warn('Web Notifications not supported');
      return null;
    }

    if (this.permissionStatus !== 'granted') {
      console.warn('Web Notifications not granted, queuing notification');
      this.notificationQueue.push(notificationData);
      return null;
    }

    // Check if user has enabled this type of notification
    if (!this.shouldSendNotification(notificationData.data?.type)) {
      console.log('Notification type disabled by user settings');
      return null;
    }

    try {
      const options: NotificationOptions = {
        body: notificationData.body,
        icon: notificationData.icon || '/icon.png',
        badge: notificationData.badge || '/badge.png',
        // image: notificationData.image, // Not supported in all browsers
        data: notificationData.data || {},
        tag: notificationData.tag || notificationData.data?.type,
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false,
        // timestamp: notificationData.timestamp || Date.now(), // Not supported in all browsers
        // iOS 18+ specific options
        ...(this.isIOS18Supported() && {
          // Note: These are conceptual - actual implementation depends on browser support
          dir: 'auto',
          lang: 'en',
          renotify: true,
        }),
        // Android 15+ specific options
        ...(this.isAndroid15Supported() && {
          // Note: These are conceptual - actual implementation depends on browser support
          actions: this.getSmartReplies(notificationData.data?.type),
        }),
      };

      const notification = new Notification(notificationData.title, options);
      
      // Set up notification event handlers
      notification.onclick = (event) => {
        console.log('Latest web notification clicked:', event);
        this.handleNotificationClick(notification);
      };

      notification.onclose = (event) => {
        console.log('Latest web notification closed:', event);
      };

      notification.onshow = (event) => {
        console.log('Latest web notification shown:', event);
        this.trackNotificationShown(notificationData.data);
      };

      console.log('Latest web notification sent:', notificationData.title);
      this.retryAttempts = 0; // Reset retry counter on success
      return notificationData.tag || 'web-notification';
    } catch (error) {
      console.error('Failed to send latest web notification:', error);
      
      // Implement retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying web notification in ${delay}ms (attempt ${retryCount + 1})`);
        
        setTimeout(() => {
          this.sendLatestNotification(notificationData, retryCount + 1);
        }, delay);
      }
      
      return null;
    }
  }

  /**
   * Check if iOS 18+ features are supported
   */
  private isIOS18Supported(): boolean {
    // This is a conceptual check - actual implementation depends on browser support
    return /iPhone|iPad|iPod/.test(navigator.userAgent) && 
           parseInt(navigator.userAgent.match(/OS (\d+)/)?.[1] || '0') >= 18;
  }

  /**
   * Check if Android 15+ features are supported
   */
  private isAndroid15Supported(): boolean {
    // This is a conceptual check - actual implementation depends on browser support
    return /Android/.test(navigator.userAgent) && 
           parseInt(navigator.userAgent.match(/Android (\d+)/)?.[1] || '0') >= 15;
  }

  /**
   * Get smart replies for Android 15+
   */
  private getSmartReplies(type?: string): NotificationAction[] {
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
    return this.sendLatestNotification({
      title: `🚨 ${title}`,
      body: content,
      icon: '/emergency-icon.png',
      badge: '/emergency-badge.png',
      requireInteraction: true,
      silent: false,
      interruptionLevel: 'critical',
      relevanceScore: 1.0,
      threadIdentifier: 'emergency-alerts',
      data: {
        type: 'emergency',
        priority,
        timestamp: Date.now(),
        smartReplies: true,
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
    return this.sendLatestNotification({
      title: `⚠️ ${title}`,
      body: content,
      icon: '/alert-icon.png',
      badge: '/alert-badge.png',
      requireInteraction: priority === 'High',
      silent: priority === 'Low',
      interruptionLevel: priority === 'High' ? 'timeSensitive' : 'active',
      relevanceScore: priority === 'High' ? 0.8 : 0.6,
      threadIdentifier: 'community-alerts',
      data: {
        type: 'alert',
        priority,
        timestamp: Date.now(),
        smartReplies: true,
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
      icon: '/info-icon.png',
      badge: '/info-badge.png',
      requireInteraction: false,
      silent: true,
      interruptionLevel: 'passive',
      relevanceScore: 0.3,
      threadIdentifier: 'community-info',
      data: {
        type: 'info',
        timestamp: Date.now(),
        smartReplies: false,
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
  public getPermissionStatus(): NotificationPermission {
    return this.permissionStatus;
  }

  /**
   * Get notification settings
   */
  public getSettings(): LatestWebNotificationSettings | null {
    return this.notificationSettings;
  }

  /**
   * Update notification settings
   */
  public async updateSettings(settings: Partial<LatestWebNotificationSettings>): Promise<void> {
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
      if (!this.isWebNotificationsSupported()) {
        console.warn('Web Notifications not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      
      if (permission === 'granted') {
        console.log('Web Notifications permission granted');
        // Process any queued notifications
        await this.processNotificationQueue();
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request web notification permissions:', error);
      return false;
    }
  }

  /**
   * Close a specific notification
   */
  public closeNotification(notificationId: string): void {
    // Web notifications don't have a direct way to close by ID
    // This would need to be implemented with a notification management system
    console.log('Close notification requested:', notificationId);
  }

  /**
   * Close all notifications
   */
  public closeAllNotifications(): void {
    // Web notifications don't have a direct way to close all
    // This would need to be implemented with a notification management system
    console.log('Close all notifications requested');
  }

  /**
   * Get comprehensive notification statistics with latest features
   */
  public getNotificationStats(): {
    supported: boolean;
    permissionStatus: string;
    settings: LatestWebNotificationSettings | null;
    queuedCount: number;
    features: {
      ios18Features: boolean;
      android15Features: boolean;
      announceNotifications: boolean;
      notificationSummaries: boolean;
      adaptiveNotifications: boolean;
      smartReplies: boolean;
      bubbleNotifications: boolean;
      fullScreenIntents: boolean;
    };
  } {
    return {
      supported: this.isWebNotificationsSupported(),
      permissionStatus: this.permissionStatus,
      settings: this.notificationSettings,
      queuedCount: this.notificationQueue.length,
      features: {
        ios18Features: this.isIOS18Supported(),
        android15Features: this.isAndroid15Supported(),
        announceNotifications: this.notificationSettings?.announceNotifications || false,
        notificationSummaries: this.notificationSettings?.notificationSummaries || false,
        adaptiveNotifications: this.notificationSettings?.adaptiveNotifications || false,
        smartReplies: this.notificationSettings?.smartReplies || false,
        bubbleNotifications: this.notificationSettings?.bubbleNotifications || false,
        fullScreenIntents: this.notificationSettings?.fullScreenIntents || false,
      },
    };
  }
}

// Export singleton instance
export const latestWebNotificationService = LatestWebNotificationService.getInstance();
export default latestWebNotificationService;
