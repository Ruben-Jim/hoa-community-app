import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, api } from '../services/mockConvex';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import DeveloperIndicator from '../components/DeveloperIndicator';
import CustomTabBar from '../components/CustomTabBar';
import MobileTabBar from '../components/MobileTabBar';

const FeesScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'fees' | 'fines'>('fees');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State for dynamic responsive behavior (only for web/desktop)
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Dynamic responsive check - show mobile nav when screen is too narrow for desktop nav
  // On mobile, always show mobile nav regardless of screen size
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';
  const showMobileNav = isMobileDevice || screenWidth < 1024; // Always mobile on mobile devices, responsive on web
  const showDesktopNav = !isMobileDevice && screenWidth >= 1024; // Only desktop nav on web when wide enough

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start at 1 to avoid white flash
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  
  // ScrollView ref for better control
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen for window size changes (only on web/desktop)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setScreenWidth(window.width);
      });

      return () => subscription?.remove();
    }
  }, []);

  // Set initial cursor and cleanup on unmount (web only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set initial cursor
      document.body.style.cursor = 'grab';
      
      // Ensure scroll view is properly initialized
      setTimeout(() => {
        if (scrollViewRef.current) {
          // Force a layout update
          scrollViewRef.current.scrollTo({ y: 0, animated: false });
          
          // Debug: Log scroll view properties
          console.log('FeesScreen ScrollView initialized for web');
          console.log('Screen width:', screenWidth);
          console.log('Show mobile nav:', showMobileNav);
          console.log('Show desktop nav:', showDesktopNav);
        }
      }, 100);
      
      return () => {
        document.body.style.cursor = 'default';
      };
    }
  }, [screenWidth, showMobileNav, showDesktopNav]);

  // Animation functions
  const animateStaggeredContent = () => {
    Animated.stagger(200, [
      Animated.timing(summaryAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Initialize animations on component mount
  useEffect(() => {
    animateStaggeredContent();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      case 'Overdue':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'checkmark-circle';
      case 'Pending':
        return 'time';
      case 'Overdue':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const handlePayment = (item: any, type: 'fee' | 'fine') => {
    Alert.alert(
      `Pay ${type === 'fee' ? 'Fee' : 'Fine'}`,
      `Would you like to pay ${formatCurrency(item.amount)} for ${type === 'fee' ? item.name : item.violation}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => Alert.alert('Payment', 'Payment processing would be integrated here.') }
      ]
    );
  };

  // 🚧 MOCK DATA FOR DEMONSTRATION 🚧
  // This shows what the FeesScreen will look like with real data
  // Replace with actual Convex queries when ready:
  // const fees = useQuery(api.fees.getAll) ?? [];
  // const fines = useQuery(api.fines.getAll) ?? [];
  
  const mockFees = [
    {
      _id: 'mock-fee-1',
      name: 'Monthly HOA Dues',
      amount: 250,
      frequency: 'Monthly',
      dueDate: '2024-08-01',
      description: 'Standard monthly HOA assessment for maintenance and services',
      isLate: false,
    },
    {
      _id: 'mock-fee-2',
      name: 'Landscape Maintenance',
      amount: 75,
      frequency: 'Monthly',
      dueDate: '2024-08-01',
      description: 'Front yard maintenance and irrigation service',
      isLate: false,
    },
    {
      _id: 'mock-fee-3',
      name: 'Annual Assessment',
      amount: 500,
      frequency: 'Annually',
      dueDate: '2024-12-31',
      description: 'Annual capital improvement fund for community projects',
      isLate: false,
    },
    {
      _id: 'mock-fee-4',
      name: 'Trash Collection',
      amount: 35,
      frequency: 'Monthly',
      dueDate: '2024-08-15',
      description: 'Monthly trash and recycling collection service',
      isLate: true,
    },
    {
      _id: 'mock-fee-5',
      name: 'Pool Maintenance',
      amount: 120,
      frequency: 'Monthly',
      dueDate: '2024-08-01',
      description: 'Community pool maintenance, cleaning, and chemical treatment',
      isLate: false,
    },
    {
      _id: 'mock-fee-6',
      name: 'Security Service',
      amount: 45,
      frequency: 'Monthly',
      dueDate: '2024-08-01',
      description: 'Night security patrol and gate monitoring',
      isLate: false,
    }
  ];

  const mockFines = [
    {
      _id: 'mock-fine-1',
      violation: 'Unauthorized Parking',
      amount: 50,
      dateIssued: '2024-07-15',
      dueDate: '2024-08-15',
      status: 'Pending',
      description: 'Vehicle parked on street overnight without permit',
    },
    {
      _id: 'mock-fine-2',
      violation: 'Landscaping Violation',
      amount: 100,
      dateIssued: '2024-07-10',
      dueDate: '2024-08-10',
      status: 'Paid',
      description: 'Unapproved plants in front yard - not in compliance with HOA guidelines',
    },
    {
      _id: 'mock-fine-3',
      violation: 'Noise Complaint',
      amount: 75,
      dateIssued: '2024-07-20',
      dueDate: '2024-08-20',
      status: 'Overdue',
      description: 'Excessive noise after 10 PM - multiple neighbor complaints',
    },
    {
      _id: 'mock-fine-4',
      violation: 'Pet Violation',
      amount: 25,
      dateIssued: '2024-07-25',
      dueDate: '2024-08-25',
      status: 'Pending',
      description: 'Dog off leash in common areas - first offense',
    },
    {
      _id: 'mock-fine-5',
      violation: 'Garbage Violation',
      amount: 40,
      dateIssued: '2024-07-05',
      dueDate: '2024-08-05',
      status: 'Paid',
      description: 'Garbage cans left out past collection day',
    },
    {
      _id: 'mock-fine-6',
      violation: 'Exterior Modification',
      amount: 150,
      dateIssued: '2024-07-12',
      dueDate: '2024-08-12',
      status: 'Overdue',
      description: 'Exterior paint color change without HOA approval',
    },
    {
      _id: 'mock-fine-7',
      violation: 'Holiday Decorations',
      amount: 30,
      dateIssued: '2024-07-30',
      dueDate: '2024-08-30',
      status: 'Pending',
      description: 'Holiday decorations left up past allowed timeframe',
    }
  ];

  // Use mock data for demonstration
  const fees = mockFees;
  const fines = mockFines;
  const totalFees = fees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
  const totalFines = fines.reduce((sum: number, fine: any) => sum + fine.amount, 0);
  const overdueFines = fines.filter((fine: any) => fine.status === 'Overdue').reduce((sum: number, fine: any) => sum + fine.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Mobile Navigation - Only when screen is narrow */}
        {showMobileNav && (
          <MobileTabBar 
            isMenuOpen={isMenuOpen}
            onMenuClose={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Header */}
        <Animated.View style={{
          opacity: fadeAnim,
        }}>
          <ImageBackground
            source={require('../../assets/hoa-4k.jpg')}
            style={styles.header}
            imageStyle={styles.headerImage}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerTop}>
              {/* Hamburger Menu - Only when mobile nav is shown */}
              {showMobileNav && (
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <Ionicons name="menu" size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
              
              <View style={styles.headerLeft}>
                <View style={styles.titleContainer}>
                  <Text style={styles.headerTitle}>Fees & Fines</Text>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO DATA</Text>
                  </View>
                  <DeveloperIndicator />
                  <BoardMemberIndicator />
                </View>
                <Text style={styles.headerSubtitle}>
                  Manage your HOA payments and violations
                </Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Custom Tab Bar - Only when screen is wide enough */}
        {showDesktopNav && (
          <Animated.View style={{
            opacity: fadeAnim,
          }}>
            <CustomTabBar />
          </Animated.View>
        )}
        
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.scrollContainer, Platform.OS === 'web' && styles.webScrollContainer]}
          contentContainerStyle={[styles.scrollContent, Platform.OS === 'web' && styles.webScrollContent]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          alwaysBounceVertical={false}
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
          // Enhanced desktop scrolling
          decelerationRate="normal"
          directionalLockEnabled={true}
          canCancelContentTouches={true}
          // Web-specific enhancements
          {...(Platform.OS === 'web' && {
            onScrollBeginDrag: () => {
              if (Platform.OS === 'web') {
                document.body.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
              }
            },
            onScrollEndDrag: () => {
              if (Platform.OS === 'web') {
                document.body.style.cursor = 'grab';
                document.body.style.userSelect = 'auto';
              }
            },
            onScroll: () => {
              // Ensure scrolling is working
            },
          })}
        >
        {/* Summary Cards */}
        <Animated.View style={[
          styles.section,
          {
            opacity: summaryAnim,
            transform: [{
              translateY: summaryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Fees</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalFees)}</Text>
              <Text style={styles.summarySubtext}>{fees.length} active fees</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Fines</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalFines)}</Text>
              <Text style={styles.summarySubtext}>{fines.length} violations</Text>
            </View>
            
            {overdueFines > 0 && (
              <View style={[styles.summaryCard, styles.overdueCard]}>
                <Text style={styles.summaryLabel}>Overdue</Text>
                <Text style={[styles.summaryAmount, styles.overdueAmount]}>{formatCurrency(overdueFines)}</Text>
                <Text style={styles.summarySubtext}>Requires immediate attention</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View style={[
          styles.section,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'fees' && styles.activeTab]}
              onPress={() => setActiveTab('fees')}
            >
              <Ionicons 
                name="card" 
                size={20} 
                color={activeTab === 'fees' ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'fees' && styles.activeTabText]}>
                Fees ({fees.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'fines' && styles.activeTab]}
              onPress={() => setActiveTab('fines')}
            >
              <Ionicons 
                name="warning" 
                size={20} 
                color={activeTab === 'fines' ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'fines' && styles.activeTabText]}>
                Fines ({fines.length})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[
          styles.section,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          {activeTab === 'fees' ? (
            <View>
              <Text style={styles.sectionTitle}>HOA Fees</Text>
              {fees.map((fee: any) => (
                <View key={fee._id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{fee.name}</Text>
                      <Text style={styles.itemDescription}>{fee.description}</Text>
                      <Text style={styles.itemFrequency}>{fee.frequency}</Text>
                    </View>
                    <View style={styles.itemAmount}>
                      <Text style={styles.amountText}>{formatCurrency(fee.amount)}</Text>
                      <Text style={styles.dueDate}>Due: {formatDate(fee.dueDate)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemFooter}>
                    <View style={styles.statusContainer}>
                      <Ionicons 
                        name={fee.isLate ? "warning" : "checkmark-circle"} 
                        size={16} 
                        color={fee.isLate ? "#ef4444" : "#10b981"} 
                      />
                      <Text style={[styles.statusText, { color: fee.isLate ? "#ef4444" : "#10b981" }]}>
                        {fee.isLate ? 'Late' : 'Current'}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => handlePayment(fee, 'fee')}
                    >
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Violations & Fines</Text>
              {fines.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                  <Text style={styles.emptyStateText}>No violations found</Text>
                  <Text style={styles.emptyStateSubtext}>Keep up the good work!</Text>
                </View>
              ) : (
                fines.map((fine: any) => (
                  <View key={fine._id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{fine.violation}</Text>
                        <Text style={styles.itemDescription}>{fine.description}</Text>
                        <Text style={styles.itemDate}>Issued: {formatDate(fine.dateIssued)}</Text>
                      </View>
                      <View style={styles.itemAmount}>
                        <Text style={styles.amountText}>{formatCurrency(fine.amount)}</Text>
                        <Text style={styles.dueDate}>Due: {formatDate(fine.dueDate)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemFooter}>
                      <View style={styles.statusContainer}>
                        <Ionicons 
                          name={getStatusIcon(fine.status) as any} 
                          size={16} 
                          color={getStatusColor(fine.status)} 
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(fine.status) }]}>
                          {fine.status}
                        </Text>
                      </View>
                      
                      {fine.status !== 'Paid' && (
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => handlePayment(fine, 'fine')}
                        >
                          <Text style={styles.payButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </Animated.View>

        {/* Payment Info */}
        <Animated.View style={[
          styles.section,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.infoText}>
            • Payments can be made online through the HOA portal
          </Text>
          <Text style={styles.infoText}>
            • Checks can be mailed to the HOA office
          </Text>
          <Text style={styles.infoText}>
            • Late payments may incur additional fees
          </Text>
          <Text style={styles.infoText}>
            • For payment questions, contact the treasurer
          </Text>
        </Animated.View>
        
        {/* Additional content to ensure scrollable content */}
        <View style={styles.spacer} />
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
  webScrollContainer: {
    ...(Platform.OS === 'web' && {
      cursor: 'grab' as any,
      userSelect: 'none' as any,
      WebkitUserSelect: 'none' as any,
      MozUserSelect: 'none' as any,
      msUserSelect: 'none' as any,
      overflow: 'auto' as any,
      height: '100vh' as any,
      maxHeight: '100vh' as any,
      position: 'relative' as any,
    }),
  },
  scrollContent: {
    paddingBottom: 20,
  },
  webScrollContent: {
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
      flexGrow: 1,
      paddingBottom: 100 as any,
    }),
  },
  spacer: {
    height: Platform.OS === 'web' ? 200 : 100,
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
    marginBottom: 10,
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  demoBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
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
  section: {
    margin: 15,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  overdueCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  overdueAmount: {
    color: '#dc2626',
  },
  summarySubtext: {
    fontSize: 10,
    color: '#9ca3af',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
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
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemFrequency: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  payButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default FeesScreen; 