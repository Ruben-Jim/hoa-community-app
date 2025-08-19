import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const NotificationDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const notification = route.params?.notification;

  if (!notification) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Notification not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#dc2626';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'warning';
      case 'Medium':
        return 'information-circle';
      case 'Low':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return 'shield';
      case 'Maintenance':
        return 'construct';
      case 'Event':
        return 'calendar';
      case 'Lost Pet':
        return 'paw';
      default:
        return 'information-circle';
    }
  };

  const handleContactSecurity = () => {
    Alert.alert(
      'Contact Security',
      'Would you like to call security?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:911') }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share Alert',
      'Sharing functionality would be implemented here.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.priorityIndicator}>
          <Ionicons 
            name={getPriorityIcon(notification.priority) as any} 
            size={32} 
            color={getPriorityColor(notification.priority)} 
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{notification.title}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.priorityBadge}>
              <Text style={[styles.priorityText, { color: getPriorityColor(notification.priority) }]}>
                {notification.priority} Priority
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Ionicons 
                name={getCategoryIcon(notification.category) as any} 
                size={12} 
                color="#6b7280" 
              />
              <Text style={styles.categoryText}>{notification.category}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <Ionicons name="time" size={20} color="#6b7280" />
          <Text style={styles.statusLabel}>Posted:</Text>
          <Text style={styles.statusValue}>{formatDate(notification.timestamp)}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: notification.isActive ? '#10b981' : '#9ca3af' }
          ]} />
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusValue,
            { color: notification.isActive ? '#10b981' : '#9ca3af' }
          ]}>
            {notification.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentSection}>
        <Text style={styles.contentTitle}>Details</Text>
        <Text style={styles.content}>{notification.content}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        
        {notification.category === 'Security' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleContactSecurity}
          >
            <Ionicons name="call" size={20} color="#dc2626" />
            <Text style={styles.actionButtonText}>Contact Security</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Ionicons name="share" size={20} color="#2563eb" />
          <Text style={styles.actionButtonText}>Share Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
          <Text style={styles.actionButtonText}>Back to Alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Information */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Important Information</Text>
        
        {notification.category === 'Security' && (
          <View style={styles.infoItem}>
            <Ionicons name="shield" size={16} color="#dc2626" />
            <Text style={styles.infoText}>
              If you see suspicious activity, contact security immediately and do not approach.
            </Text>
          </View>
        )}

        {notification.category === 'Maintenance' && (
          <View style={styles.infoItem}>
            <Ionicons name="construct" size={16} color="#f59e0b" />
            <Text style={styles.infoText}>
              Please be patient during maintenance work and follow any posted instructions.
            </Text>
          </View>
        )}

        {notification.category === 'Lost Pet' && (
          <View style={styles.infoItem}>
            <Ionicons name="paw" size={16} color="#8b5cf6" />
            <Text style={styles.infoText}>
              If you find a lost pet, contact the owner or bring it to the community center.
            </Text>
          </View>
        )}

        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={16} color="#2563eb" />
          <Text style={styles.infoText}>
            For questions about this alert, contact the HOA office during business hours.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  priorityIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 26,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  contentSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

export default NotificationDetailScreen; 