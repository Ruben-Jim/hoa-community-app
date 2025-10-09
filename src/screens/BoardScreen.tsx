import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
  Animated,
  Platform,
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

const BoardScreen = () => {
  const { user } = useAuth();
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
  const membersAnim = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;
  
  // ScrollView ref for better control
  const scrollViewRef = useRef<ScrollView>(null);
  
  const handleContact = (member: any, type: 'phone' | 'email') => {
    if (type === 'phone') {
      Linking.openURL(`tel:${member.phone}`);
    } else {
      Linking.openURL(`mailto:${member.email}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const members = useQuery(api.boardMembers.getAll) ?? [];

  // Animation functions
  const animateStaggeredContent = () => {
    Animated.stagger(200, [
      Animated.timing(membersAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(infoAnim, {
        toValue: 1,
        duration: 600,
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
          
          // Debug: Log scroll view properties
          console.log('BoardScreen ScrollView initialized for web');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Mobile Navigation - Only when screen is narrow */}
      {showMobileNav && (
        <MobileTabBar 
          isMenuOpen={isMenuOpen}
          onMenuClose={() => setIsMenuOpen(false)}
        />
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, Platform.OS === 'web' && styles.webScrollContainer]}
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
                <View style={styles.titleContainer}>
                  <Text style={styles.headerTitle}>Board of Directors</Text>
                  <DeveloperIndicator />
                  <BoardMemberIndicator />
                </View>
                <Text style={styles.headerSubtitle}>
                  Your elected representatives serving the community
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

      <Animated.View style={{
        opacity: membersAnim,
      }}>
        {members.map((member: any) => (
          <View key={member._id} style={styles.memberCard}>
            {/* Member Header with Avatar and Basic Info */}
            <View style={styles.memberHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {member.image ? (
                    <Image 
                      source={{ uri: member.image }} 
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={32} color="#6b7280" />
                  )}
                </View>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberPosition}>{member.position}</Text>
                {member.termEnd && (
                  <View style={styles.memberTermContainer}>
                    <Ionicons name="calendar" size={16} color="#6b7280" />
                    <Text style={styles.memberTerm}>
                      Term ends: {formatDate(member.termEnd)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Member Bio Section */}
            {member.bio && (
              <Text style={styles.memberBio} numberOfLines={10}>
                {member.bio}
              </Text>
            )}

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <View style={styles.contactHeader}>
                <Ionicons name="call" size={16} color="#6b7280" />
                <Text style={styles.contactLabel}>Contact Information</Text>
              </View>
              <View style={styles.contactButtons}>
                {member.phone && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContact(member, 'phone')}
                  >
                    <Ionicons name="call" size={20} color="#2563eb" />
                    <Text style={styles.contactText}>{member.phone}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact(member, 'email')}
                >
                  <Ionicons name="mail" size={20} color="#2563eb" />
                  <Text style={styles.contactText}>{member.email}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={{
        opacity: infoAnim,
      }}>
        {/* Board Meetings Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoTitle}>Board Meetings</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Second Tuesday of each month at 7:00 PM
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Community Center
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Open to residents - speak during open forum
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoTitle}>Contact the Board</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                General inquiries: Contact board secretary or use contact info above
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.infoText}>
                Urgent matters: Contact HOA office directly
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Resources Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="document-text" size={24} color="#2563eb" />
            </View>
            <Text style={styles.infoTitle}>Resources</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="document" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Meeting minutes and agendas available upon request
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={16} color="#6b7280" />
              <Text style={styles.infoText}>
                Board decisions are made in accordance with HOA bylaws
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      {/* Additional content to ensure scrollable content */}
      <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  memberCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  memberPosition: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  memberTermContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberTerm: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  memberBio: {
    fontSize: 15,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '400',
    paddingHorizontal: 4,
  },
  contactSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  contactButtons: {
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 0,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginTop: 8,
    lineHeight: 24,
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
});

export default BoardScreen; 