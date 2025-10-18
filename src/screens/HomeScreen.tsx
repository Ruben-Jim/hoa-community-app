import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ImageBackground,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import DeveloperIndicator from '../components/DeveloperIndicator';
import CustomTabBar from '../components/CustomTabBar';
import MobileTabBar from '../components/MobileTabBar';
import { webCompatibleAlert } from '../utils/webCompatibleAlert';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const hoaInfo = useQuery(api.hoaInfo.get);
  const emergencyNotifications = useQuery(api.emergencyNotifications.getActive);
  const communityPosts = useQuery(api.communityPosts.getAll);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { alertState, showAlert, hideAlert } = useCustomAlert();
  
  // State for dynamic responsive behavior (only for web/desktop)
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  
  // Check if app is already installed (standalone mode)
  const isAppInstalled = Platform.OS === 'web' && 
    ('standalone' in window.navigator) && 
    (window.navigator as any).standalone;
  
  // Dynamic responsive check - show mobile nav when screen is too narrow for desktop nav
  // On mobile, always show mobile nav regardless of screen size
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';
  const showMobileNav = isMobileDevice || screenWidth < 1024; // Always mobile on mobile devices, responsive on web
  const showDesktopNav = !isMobileDevice && screenWidth >= 1024; // Only desktop nav on web when wide enough

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start at 1 to avoid white flash
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const postsAnim = useRef(new Animated.Value(0)).current;
  const officeAnim = useRef(new Animated.Value(0)).current;
  
  // ScrollView ref for better control
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation functions

  const animateStaggeredContent = () => {
    Animated.stagger(200, [
      Animated.timing(quickActionsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(postsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(officeAnim, {
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
          
          // ScrollView initialized for web
        }
      }, 100);
      
      return () => {
        document.body.style.cursor = 'default';
      };
    }
  }, [screenWidth, showMobileNav, showDesktopNav]);

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      if (hoaInfo?.phone) Linking.openURL(`tel:${hoaInfo.phone}`);
    } else {
      if (hoaInfo?.email) Linking.openURL(`mailto:${hoaInfo.email}`);
    }
  };

  const handleEmergency = () => {
    webCompatibleAlert({
      title: 'Emergency Contact',
      message: `Call: ${hoaInfo?.emergencyContact ?? ''}`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => hoaInfo?.emergencyContact && Linking.openURL(`tel:${hoaInfo.emergencyContact}`) 
        }
      ]
    });
  };

  const handleSignOut = () => {
    showAlert({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const activeNotifications = emergencyNotifications?.filter((n: any) => n.isActive) ?? [];

  // iOS Home Screen functionality
  const handleIOSInstall = () => {
    if (Platform.OS === 'web') {
      // Check if it's iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        setShowIOSInstallPrompt(true);
      } else {
        showAlert({
          title: 'Not Available',
          message: 'This feature is only available on iOS Safari.',
          buttons: [
            { text: 'OK', onPress: () => {} }
          ]
        });
      }
    } else {
      showAlert({
        title: 'Not Available',
        message: 'This feature is only available on iOS Safari.',
        buttons: [
          { text: 'OK', onPress: () => {} }
        ]
      });
    }
  };

  const dismissIOSPrompt = () => {
    setShowIOSInstallPrompt(false);
  };

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
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.hoaName}>{hoaInfo?.name ?? 'Shelton Springs'}</Text>
            <Text style={styles.subtitle}>Your Community Connection</Text>
          </View>
          
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
              
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                Welcome back, {user.firstName} {user.lastName}
              </Text>
              <DeveloperIndicator />
              <BoardMemberIndicator />
            </View>
            <Text style={styles.userRole}>
              {(user.isDev ?? false) ? 'Developer' : user.isBoardMember ? 'Board Member' : user.isRenter ? 'Renter' : 'Resident'} • {user.address}
            </Text>
          </View>
        )}
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

      {/* Quick Actions */}
      {/* <Animated.View style={[
        styles.quickActions,
        {
          opacity: quickActionsAnim,
          transform: [{
            translateY: quickActionsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleContact('phone')}
          >
            <Ionicons name="call" size={24} color="#64748b" />
            <Text style={styles.actionText}>Call Office</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleContact('email')}
          >
            <Ionicons name="mail" size={24} color="#64748b" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEmergency}
          >
            <Ionicons name="warning" size={24} color="#64748b" />
            <Text style={styles.actionText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </Animated.View> */}

       {/* iOS Install Button - Only show on iOS Safari and when app is not installed */}
       {Platform.OS === 'web' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !isAppInstalled && (
        <Animated.View style={[
          styles.section,
          {
            opacity: quickActionsAnim,
            transform: [{
              translateY: quickActionsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          <View style={styles.iosInstallContainer}>
            <View style={styles.iosInstallContent}>
              <Ionicons name="phone-portrait" size={32} color="#007AFF" />
              <View style={styles.iosInstallText}>
                <Text style={styles.iosInstallTitle}>Try the App</Text>
                <Text style={styles.iosInstallDescription}>
                  Add to your home screen for a better experience
                </Text>
              </View>
              <TouchableOpacity
                style={styles.iosInstallButton}
                onPress={handleIOSInstall}
              >
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.iosInstallButtonText}>Install</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Active Notifications */}
      {activeNotifications.length > 0 && (
        <Animated.View style={[
          styles.section, 
        styles.emergencySection,
        {
          opacity: quickActionsAnim,
          transform: [{
            translateY: quickActionsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
        ]}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Active Alerts</Text>
          </View>
          {activeNotifications.slice(0, 2).map((notification: any) => (
            <View key={notification._id} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <Ionicons 
                  name={notification.type === 'Emergency' ? 'warning' : 'information-circle'} 
                  size={20} 
                  color={notification.priority === 'High' ? '#dc2626' : '#f59e0b'} 
                />
                <Text style={styles.notificationTitle}>{notification.title}</Text>
              </View>
              <Text style={styles.notificationContent}>{notification.content}</Text>
              <Text style={styles.notificationTime}>
                {formatDate(new Date(notification.createdAt).toISOString())}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}


      {/* Recent Community Posts */}
      <Animated.View style={[
        styles.section,
        {
          opacity: postsAnim,
          transform: [{
            translateY: postsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}>
        <View style={styles.communityHeader}>
          <Ionicons name="people" size={24} color="#64748b" />
          <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Recent Community Posts</Text>
        </View>
        {communityPosts?.slice(0, 2).map((post: any, index: number) => (
          <Animated.View 
            key={post._id} 
            style={[
              styles.postCard,
              {
                opacity: postsAnim,
                transform: [{
                  translateY: postsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30 + (index * 20), 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.postHeader}>
              <View style={styles.postAuthorInfo}>
                <View style={styles.postAvatar}>
                  {post.authorProfileImage ? (
                    <Image 
                      source={{ uri: post.authorProfileImage }} 
                      style={styles.postAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#6b7280" />
                  )}
                </View>
                <Text style={styles.postAuthor}>{post.author}</Text>
              </View>
              <Text style={styles.postCategory}>{post.category}</Text>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>
              {post.content}
            </Text>
            <View style={styles.postFooter}>
              <Text style={styles.postTime}>{formatDate(new Date(post.createdAt).toISOString())}</Text>
              <View style={styles.postStats}>
                <Ionicons name="heart" size={16} color="#6b7280" />
                <Text style={styles.postStatsText}>{post.likes}</Text>
                <Ionicons name="chatbubble" size={16} color="#6b7280" />
                <Text style={styles.postStatsText}>{post.comments?.length ?? 0}</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Office Information */}
      <Animated.View style={[
        styles.section,
        {
          opacity: officeAnim,
          transform: [{
            translateY: officeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}>
        <View style={styles.officeHeader}>
          <Ionicons name="business" size={24} color="#64748b" />
          <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Office Information</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{hoaInfo?.address ?? ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{hoaInfo?.officeHours ?? ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{hoaInfo?.phone ?? ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{hoaInfo?.email ?? ''}</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Additional sections for more content */}
      <Animated.View style={[
        styles.section,
        {
          opacity: officeAnim,
          transform: [{
            translateY: officeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}>
        <View style={styles.officeHeader}>
          <Ionicons name="information-circle" size={24} color="#64748b" />
          <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Community Guidelines</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.guidelineText}>
            • Please keep noise levels down during quiet hours (10 PM - 7 AM)
          </Text>
          <Text style={styles.guidelineText}>
            • Maintain your property and common areas clean
          </Text>
          <Text style={styles.guidelineText}>
            • Follow parking regulations and assigned spaces
          </Text>
          <Text style={styles.guidelineText}>
            • Report maintenance issues promptly
          </Text>
        </View>
      </Animated.View>
      
      <Animated.View style={[
        styles.section,
        {
          opacity: officeAnim,
          transform: [{
            translateY: officeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}>
        <View style={styles.officeHeader}>
          <Ionicons name="calendar" size={24} color="#64748b" />
          <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Upcoming Events</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.eventText}>
            📅 Board Meeting - Next Tuesday at 7:00 PM
          </Text>
          <Text style={styles.eventText}>
            🏠 Community Cleanup - This Saturday 9:00 AM
          </Text>
          <Text style={styles.eventText}>
            🎉 Annual BBQ - June 15th at the Clubhouse
          </Text>
        </View>
      </Animated.View>
      
      {/* Final spacer for extra scroll space */}
      <View style={styles.spacer} />
      </ScrollView>
      </View>

      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
        type="warning"
      />

      {/* iOS Install Prompt Modal */}
      {showIOSInstallPrompt && (
        <View style={styles.iosModalOverlay}>
          <TouchableOpacity 
            style={styles.iosModalOverlayTouchable}
            activeOpacity={1}
            onPress={dismissIOSPrompt}
          >
            <TouchableOpacity 
              style={styles.iosModalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.iosModalHeader}>
                <Ionicons name="phone-portrait" size={48} color="#007AFF" />
                <Text style={styles.iosModalTitle}>Add to Home Screen</Text>
                <TouchableOpacity
                  style={styles.iosModalCloseButton}
                  onPress={dismissIOSPrompt}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            
            <View style={styles.iosModalContent}>
              <Text style={styles.iosModalDescription}>
                To install this app on your iPhone:
              </Text>
              
              <View style={styles.iosStepsContainer}>
                <View style={styles.iosStep}>
                  <View style={styles.iosStepNumber}>
                    <Text style={styles.iosStepNumberText}>1</Text>
                  </View>
                  <Text style={styles.iosStepText}>
                    Tap the <Ionicons name="share" size={16} color="#007AFF" /> Share button at the bottom of Safari
                  </Text>
                </View>
                
                <View style={styles.iosStep}>
                  <View style={styles.iosStepNumber}>
                    <Text style={styles.iosStepNumberText}>2</Text>
                  </View>
                  <Text style={styles.iosStepText}>
                    Scroll down and tap "Add to Home Screen"
                  </Text>
                </View>
                
                <View style={styles.iosStep}>
                  <View style={styles.iosStepNumber}>
                    <Text style={styles.iosStepNumberText}>3</Text>
                  </View>
                  <Text style={styles.iosStepText}>
                    Tap "Add" to confirm
                  </Text>
                </View>
              </View>
              
              <Text style={styles.iosModalNote}>
                The app will appear on your home screen like a native app!
              </Text>
            </View>
            
              <View style={styles.iosModalButtons}>
                <TouchableOpacity
                  style={styles.iosModalButton}
                  onPress={dismissIOSPrompt}
                >
                  <Text style={styles.iosModalButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  signOutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginLeft: 12,
  },
  userInfo: {
    marginTop: 5,
    zIndex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userRole: {
    fontSize: 14,
    color: '#e0e7ff',
    opacity: 0.9,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  hoaName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  subtitle: {
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  emergencySection: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  notificationCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  notificationContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  postAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  postCategory: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    marginRight: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  guidelineText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  // iOS Install Button Styles
  iosInstallContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  iosInstallContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iosInstallText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  iosInstallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  iosInstallDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  iosInstallButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  iosInstallButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  // iOS Install Modal Styles
  iosModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  iosModalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  iosModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iosModalHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    position: 'relative',
  },
  iosModalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  iosModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  iosModalContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iosModalDescription: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  iosStepsContainer: {
    marginBottom: 20,
  },
  iosStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iosStepNumber: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  iosStepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  iosStepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  iosModalNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  iosModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iosModalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  iosModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 