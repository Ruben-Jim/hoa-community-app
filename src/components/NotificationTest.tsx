import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useNotifications from '../hooks/useNotifications';

interface NotificationTestProps {
  onClose?: () => void;
}

const NotificationTest: React.FC<NotificationTestProps> = ({ onClose }) => {
  const {
    isEnabled,
    permissionStatus,
    requestPermissions,
    sendEmergencyAlert,
    sendAlert,
    sendInfo,
  } = useNotifications();

  const handleTestEmergency = async () => {
    const result = await sendEmergencyAlert(
      'Test Emergency',
      'This is a test emergency notification to verify the system is working correctly.',
      'High'
    );
    
    if (result) {
      Alert.alert('Success', 'Emergency notification sent!');
    } else {
      Alert.alert('Error', 'Failed to send emergency notification. Check if notifications are enabled.');
    }
  };

  const handleTestAlert = async () => {
    const result = await sendAlert(
      'Test Alert',
      'This is a test alert notification to verify the system is working correctly.',
      'Medium'
    );
    
    if (result) {
      Alert.alert('Success', 'Alert notification sent!');
    } else {
      Alert.alert('Error', 'Failed to send alert notification. Check if notifications are enabled.');
    }
  };

  const handleTestInfo = async () => {
    const result = await sendInfo(
      'Test Info',
      'This is a test info notification to verify the system is working correctly.'
    );
    
    if (result) {
      Alert.alert('Success', 'Info notification sent!');
    } else {
      Alert.alert('Error', 'Failed to send info notification. Check if notifications are enabled.');
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert('Info', 'Notification permissions denied. You can enable them in settings.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={24} color="#8b5cf6" />
        <Text style={styles.title}>Notification Test</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={styles.statusRow}>
            <Ionicons
              name={isEnabled ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isEnabled ? '#10b981' : '#ef4444'}
            />
            <Text style={[styles.statusText, { color: isEnabled ? '#10b981' : '#ef4444' }]}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        <Text style={styles.permissionText}>
          Permission: {permissionStatus}
        </Text>

        {!isEnabled && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermissions}
          >
            <Ionicons name="notifications" size={20} color="#ffffff" />
            <Text style={styles.permissionButtonText}>Request Permissions</Text>
          </TouchableOpacity>
        )}

        <View style={styles.testButtons}>
          <TouchableOpacity
            style={[styles.testButton, styles.emergencyButton]}
            onPress={handleTestEmergency}
            disabled={!isEnabled}
          >
            <Ionicons name="warning" size={20} color="#ffffff" />
            <Text style={styles.testButtonText}>Test Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.alertButton]}
            onPress={handleTestAlert}
            disabled={!isEnabled}
          >
            <Ionicons name="information-circle" size={20} color="#ffffff" />
            <Text style={styles.testButtonText}>Test Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.infoButton]}
            onPress={handleTestInfo}
            disabled={!isEnabled}
          >
            <Ionicons name="help-circle" size={20} color="#ffffff" />
            <Text style={styles.testButtonText}>Test Info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            Use these buttons to test different types of notifications. Make sure notifications are enabled first.
          </Text>
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButtons: {
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    opacity: 1,
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
  },
  alertButton: {
    backgroundColor: '#f59e0b',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
});

export default NotificationTest;
