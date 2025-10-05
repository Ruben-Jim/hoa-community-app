import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import CustomTabBar from '../components/CustomTabBar';
import MobileTabBar from '../components/MobileTabBar';

const EmergencyScreen = () => {
  const { user } = useAuth();
  const notifications = useQuery(api.emergencyNotifications.getAll) ?? [];
  const createNotification = useMutation(api.emergencyNotifications.create);
  const deactivateNotification = useMutation(api.emergencyNotifications.deactivate);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    content: '',
    type: 'Alert' as any,
    priority: 'Medium' as any,
    category: 'Other' as any,
  });

  // Check if device is mobile based on screen width
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Animation values
  const alertModalOpacity = useRef(new Animated.Value(0)).current;
  const alertModalTranslateY = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start at 0 for individual notification animations

  const priorities = ['High', 'Medium', 'Low'];
  const categories = ['Security', 'Maintenance', 'Event', 'Lost Pet', 'Other'];
  const types = ['Emergency', 'Alert', 'Info'];

  // Modern animation functions
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(alertModalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(alertModalTranslateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(alertModalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(alertModalTranslateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
    });
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  // Initialize animations on component mount
  useEffect(() => {
    // Animate individual notifications
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
    animateOut(() => {
      setShowNewAlertModal(false);
    });
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
        {/* Mobile Navigation - Only for Mobile */}
        {isMobile && (
          <MobileTabBar 
            isMenuOpen={isMenuOpen}
            onMenuClose={() => setIsMenuOpen(false)}
          />
        )}
        
        <ScrollView style={styles.scrollContainer}>
          {/* Header with ImageBackground */}
          <ImageBackground
            source={require('../../assets/hoa-4k.jpg')}
            style={styles.header}
            imageStyle={styles.headerImage}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerTop}>
              {/* Hamburger Menu - Only when mobile nav is shown */}
              {isMobile && (
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <Ionicons name="menu" size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
              
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Emergency Alerts</Text>
                <Text style={styles.headerSubtitle}>
                  Stay informed about community emergencies and important updates
                </Text>
              </View>
            </View>
          </ImageBackground>

          {/* Custom Tab Bar - Only for Desktop */}
          {!isMobile && (
            <CustomTabBar />
          )}

        {/* Priority Filter */}
        <SafeAreaView style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
              style={styles.filterScrollView}
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
          </View>
        </SafeAreaView>


        {/* Category Filter with New Alert Button */}
        <SafeAreaView style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
              style={styles.filterScrollView}
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
            
            {/* New Alert Button - Desktop Only (Board Members Only) */}
            {!isMobile && isBoardMember && (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.newAlertButton}
                  onPress={() => {
                    animateButtonPress();
                    setShowNewAlertModal(true);
                    animateIn();
                  }}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.newAlertButtonText}>New Alert</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
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
            filteredNotifications.map((notification: any, index: number) => (
              <Animated.View 
                key={notification._id} 
                style={[
                  styles.notificationCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }]
                  }
                ]}
              >
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
              </Animated.View>
            ))
          )}
        </ScrollView>

        {/* Floating Action Button for Mobile (Board Members Only) */}
        {isMobile && isBoardMember && (
          <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={() => {
              animateButtonPress();
              setShowNewAlertModal(true);
              animateIn();
            }}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}

        {/* New Alert Modal */}
        <Modal
          visible={showNewAlertModal}
          transparent={true}
          animationType="none"
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.modalContainer,
              {
                opacity: alertModalOpacity,
                transform: [{ translateY: alertModalTranslateY }],
              }
            ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Emergency Alert</Text>
              <TouchableOpacity onPress={() => animateOut(() => setShowNewAlertModal(false))}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => animateOut(() => setShowNewAlertModal(false))}
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
            </Animated.View>
          </Animated.View>
        </Modal>
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    height: 240,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
    justifyContent: 'space-between',
  },
  headerImage: {
    borderRadius: 0,
    resizeMode: 'stretch',
    width: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginRight: 12,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.9,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
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
  floatingActionButton: {
    position: 'absolute',
    top: 700,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingTop: -40,
    paddingBottom: -20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  filterScrollView: {
    flex: 1,
  },
  filterContent: {
    paddingHorizontal: 0,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 0,
    width: '90%',
    maxHeight: '90%',
    minHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 16,
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
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentInput: {
    height: 140,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default EmergencyScreen; 