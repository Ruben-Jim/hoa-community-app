import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import enhancedUnifiedNotificationManager from '../services/EnhancedUnifiedNotificationManager';
import { UnifiedNotificationSettings } from '../services/EnhancedUnifiedNotificationManager';

interface EnhancedNotificationSettingsProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const EnhancedNotificationSettings: React.FC<EnhancedNotificationSettingsProps> = ({
  onClose,
  showCloseButton = true,
}) => {
  const [settings, setSettings] = useState<UnifiedNotificationSettings | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Initialize the notification manager
      await enhancedUnifiedNotificationManager.initialize();
      
      // Load current settings and status
      const currentSettings = enhancedUnifiedNotificationManager.getSettings();
      const enabled = enhancedUnifiedNotificationManager.isEnabled();
      const status = enhancedUnifiedNotificationManager.getPermissionStatus();
      const notificationStats = await enhancedUnifiedNotificationManager.getNotificationStats();
      
      setSettings(currentSettings);
      setIsEnabled(enabled);
      setPermissionStatus(status);
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const granted = await enhancedUnifiedNotificationManager.requestPermissions();
      if (granted) {
        Alert.alert(
          'Notifications Enabled',
          'You will now receive notifications for new alerts and important updates.',
          [{ text: 'OK' }]
        );
        await loadSettings(); // Refresh settings
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to request notification permissions. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSettingChange = async (key: keyof UnifiedNotificationSettings, value: boolean) => {
    if (!settings) return;

    // Prevent disabling emergency alerts for safety
    if (key === 'emergency' && !value) {
      Alert.alert(
        'Emergency Alerts Required',
        'Emergency alerts cannot be disabled for your safety and the safety of the community. You will always receive critical notifications about emergencies, security issues, and other urgent matters.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await enhancedUnifiedNotificationManager.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      // Revert the change
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotifications = async () => {
    try {
      Alert.alert(
        'Test Notifications',
        'This will send test notifications for each type. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              const result = await enhancedUnifiedNotificationManager.testNotificationSystem();
              if (result.success) {
                Alert.alert('Success', 'All test notifications sent successfully!');
              } else {
                Alert.alert('Partial Success', `Some notifications failed: ${JSON.stringify(result.results)}`);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test notifications. Please try again.');
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Browser Settings',
        'To enable notifications, click the lock icon in your browser\'s address bar and allow notifications for this site.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Device Settings',
        'To enable notifications, go to your device settings > Apps > HOA Community App > Notifications and turn them on.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Loading...';
    if (!isEnabled) return 'Disabled';
    
    switch (permissionStatus) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Disabled';
      case 'default':
        return 'Not requested';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (isLoading) return '#6b7280';
    if (isEnabled) return '#10b981';
    if (permissionStatus === 'denied') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusIcon = () => {
    if (isLoading) return 'hourglass-outline';
    if (isEnabled) return 'checkmark-circle';
    if (permissionStatus === 'denied') return 'close-circle';
    return 'help-circle';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={24} color="#2563eb" />
          <Text style={styles.title}>Notification Settings</Text>
        </View>
        {showCloseButton && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Ionicons
                name={getStatusIcon()}
                size={20}
                color={getStatusColor()}
              />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
            <Text style={styles.permissionText}>
              Permission: {permissionStatus}
            </Text>
            {stats && (
              <Text style={styles.statsText}>
                Platform: {stats.platform} | Active: {stats.activeCount} | Scheduled: {stats.scheduledCount}
              </Text>
            )}
          </View>
        </View>

        {/* Permission Section */}
        {!isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enable Notifications</Text>
            <View style={styles.actionContainer}>
              {permissionStatus === 'default' ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={handleRequestPermissions}
                >
                  <Ionicons name="notifications" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Enable Notifications</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleOpenSettings}
                >
                  <Ionicons name="settings" size={20} color="#2563eb" />
                  <Text style={styles.secondaryButtonText}>Open Settings</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Notification Types */}
        {isEnabled && settings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.requiredSettingHeader}>
                  <Text style={styles.settingTitle}>Emergency Alerts</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>REQUIRED</Text>
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  Critical alerts requiring immediate attention. Cannot be disabled for your safety.
                </Text>
              </View>
              <Switch
                value={true} // Always true - cannot be disabled
                onValueChange={() => {}} // No-op - cannot be changed
                disabled={true} // Always disabled
                trackColor={{ false: '#10b981', true: '#10b981' }} // Always green
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Community Alerts</Text>
                <Text style={styles.settingDescription}>
                  Important community updates and announcements
                </Text>
              </View>
              <Switch
                value={settings.alerts}
                onValueChange={(value) => handleSettingChange('alerts', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.alerts ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>General Info</Text>
                <Text style={styles.settingDescription}>
                  General community information and updates
                </Text>
              </View>
              <Switch
                value={settings.info}
                onValueChange={(value) => handleSettingChange('info', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.info ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        )}

        {/* Notification Preferences */}
        {isEnabled && settings && Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Sound</Text>
                <Text style={styles.settingDescription}>
                  Play sound when notifications arrive
                </Text>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={(value) => handleSettingChange('sound', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.sound ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Vibration</Text>
                <Text style={styles.settingDescription}>
                  Vibrate device when notifications arrive
                </Text>
              </View>
              <Switch
                value={settings.vibrate}
                onValueChange={(value) => handleSettingChange('vibrate', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.vibrate ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Badge</Text>
                <Text style={styles.settingDescription}>
                  Show notification count on app icon
                </Text>
              </View>
              <Switch
                value={settings.badge}
                onValueChange={(value) => handleSettingChange('badge', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.badge ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        )}

        {/* Web-specific settings */}
        {isEnabled && settings && Platform.OS === 'web' && settings.requireInteraction !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Web Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Require Interaction</Text>
                <Text style={styles.settingDescription}>
                  Notifications stay visible until manually dismissed
                </Text>
              </View>
              <Switch
                value={settings.requireInteraction}
                onValueChange={(value) => handleSettingChange('requireInteraction', value)}
                disabled={isSaving}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
                thumbColor={settings.requireInteraction ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        )}

        {/* Test Section */}
        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.testButton]}
              onPress={handleTestNotifications}
            >
              <Ionicons name="flask" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Test All Types</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {Platform.OS === 'web'
                ? 'Web notifications work in supported browsers. You may need to allow notifications in your browser settings.'
                : 'Notifications help you stay informed about important community updates and emergencies.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: '90%',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusContainer: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  testButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  requiredSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requiredBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
});

export default EnhancedNotificationSettings;
