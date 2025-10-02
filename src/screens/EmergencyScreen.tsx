import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';

const EmergencyScreen = () => {
  const { user } = useAuth();
  const notifications = useQuery(api.emergencyNotifications.getAll) ?? [];
  const createNotification = useMutation(api.emergencyNotifications.create);
  const deactivateNotification = useMutation(api.emergencyNotifications.deactivate);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    content: '',
    type: 'Alert' as any,
    priority: 'Medium' as any,
    category: 'Other' as any,
  });

  const priorities = ['High', 'Medium', 'Low'];
  const categories = ['Security', 'Maintenance', 'Event', 'Lost Pet', 'Other'];
  const types = ['Emergency', 'Alert', 'Info'];

  // Check if user is a board member
  const isBoardMember = user?.isBoardMember && user?.isActive;

  const filteredNotifications = notifications.filter((notification: any) => {
    const matchesPriority = !selectedPriority || notification.priority === selectedPriority;
    const matchesCategory = !selectedCategory || notification.category === selectedCategory;
    return matchesPriority && matchesCategory;
  });

  const activeNotifications = filteredNotifications.filter((n: any) => n.isActive);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const handleCreateAlert = async () => {
    // Check if user is a board member
    if (!isBoardMember) {
      Alert.alert('Access Denied', 'Only board members can create emergency alerts.');
      return;
    }

    if (!newAlert.title.trim() || !newAlert.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    await createNotification({
      title: newAlert.title,
      content: newAlert.content,
      type: newAlert.type,
      priority: newAlert.priority,
      category: newAlert.category,
      isActive: true,
    });
    setNewAlert({
      title: '',
      content: '',
      type: 'Alert',
      priority: 'Medium',
      category: 'Other',
    });
    setShowNewAlertModal(false);
  };

  const handleDeactivate = async (id: string) => {
    // Check if user is a board member
    if (!isBoardMember) {
      Alert.alert('Access Denied', 'Only board members can deactivate emergency alerts.');
      return;
    }
    
    await deactivateNotification({ id: id as any });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with New Alert Button (Board Members Only) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Emergency Alerts</Text>
            <BoardMemberIndicator />
          </View>
          {isBoardMember && (
            <TouchableOpacity
              style={styles.newAlertButton}
              onPress={() => setShowNewAlertModal(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.newAlertButtonText}>New Alert</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Priority Filter */}


        <SafeAreaView style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <Text style={styles.filterLabel}>Priority:</Text>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedPriority && styles.filterButtonActive
              ]}
              onPress={() => setSelectedPriority(null)}
            >
              <Text style={[
                styles.filterButtonText,
                !selectedPriority && styles.filterButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  selectedPriority === priority && styles.filterButtonActive
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedPriority === priority && styles.filterButtonTextActive
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>


        {/* Category Filter */}
        <SafeAreaView style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <Text style={styles.filterLabel}>Category:</Text>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedCategory && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.filterButtonText,
                !selectedCategory && styles.filterButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === category && styles.filterButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>


        {/* Active Alerts Summary */}
        {activeNotifications.length > 0 && (
          <View style={styles.summaryCard}>
            <Ionicons name="warning" size={24} color="#dc2626" />
            <Text style={styles.summaryText}>
              {activeNotifications.length} active alert{activeNotifications.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              <Text style={styles.emptyStateText}>No alerts found</Text>
              <Text style={styles.emptyStateSubtext}>
                All clear! No active alerts at this time.
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification: any) => (
              <View key={notification._id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    <Ionicons
                      name={getPriorityIcon(notification.priority) as any}
                      size={24}
                      color={getPriorityColor(notification.priority)}
                    />
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <View style={styles.notificationMeta}>
                      <View style={styles.priorityBadge}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(notification.priority) }]}>
                          {notification.priority}
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
                  <View style={styles.notificationStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: notification.isActive ? '#10b981' : '#9ca3af' }
                    ]} />
                    <Text style={styles.statusText}>
                      {notification.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.notificationContent}>{notification.content}</Text>

                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTime}>
                    {formatDate(new Date(notification.createdAt).toISOString())}
                  </Text>

                  {notification.isActive && isBoardMember && (
                    <TouchableOpacity
                      style={styles.deactivateButton}
                      onPress={() => handleDeactivate(notification._id)}
                    >
                      <Text style={styles.deactivateButtonText}>Deactivate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* New Alert Modal */}
        <Modal
          visible={showNewAlertModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Emergency Alert</Text>
              <TouchableOpacity onPress={() => setShowNewAlertModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Alert Type</Text>
              <View style={styles.selectorContainer}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectorOption,
                      newAlert.type === type && styles.selectorOptionActive
                    ]}
                    onPress={() => setNewAlert(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.selectorOptionText,
                      newAlert.type === type && styles.selectorOptionTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.selectorContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.selectorOption,
                      newAlert.priority === priority && styles.selectorOptionActive
                    ]}
                    onPress={() => setNewAlert(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.selectorOptionText,
                      newAlert.priority === priority && styles.selectorOptionTextActive
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.selectorContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.selectorOption,
                      newAlert.category === category && styles.selectorOptionActive
                    ]}
                    onPress={() => setNewAlert(prev => ({ ...prev, category }))}
                  >
                    <Text style={[
                      styles.selectorOptionText,
                      newAlert.category === category && styles.selectorOptionTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter alert title..."
                value={newAlert.title}
                onChangeText={(text) => setNewAlert(prev => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={[styles.textInput, styles.contentInput]}
                placeholder="Enter alert details..."
                value={newAlert.content}
                onChangeText={(text) => setNewAlert(prev => ({ ...prev, content: text }))}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNewAlertModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAlert}
              >
                <Text style={styles.createButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  newAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newAlertButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingTop: -35,
    paddingBottom: -20,
  },
  filterContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    margin: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  notificationsContainer: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  notificationContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deactivateButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deactivateButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  selectorOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  selectorOptionActive: {
    backgroundColor: '#2563eb',
  },
  selectorOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectorOptionTextActive: {
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  contentInput: {
    height: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default EmergencyScreen; 