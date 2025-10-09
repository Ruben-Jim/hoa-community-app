import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  Animated, 
  Dimensions,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface TabItem {
  name: string;
  icon: string;
  label: string;
  color: string;
}

interface MobileTabBarProps {
  isMenuOpen?: boolean;
  onMenuClose?: () => void;
}

const MobileTabBar = ({ isMenuOpen: externalIsMenuOpen, onMenuClose }: MobileTabBarProps) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  
  const isMenuOpen = externalIsMenuOpen !== undefined ? externalIsMenuOpen : internalMenuOpen;
  
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isBoardMember = user?.isBoardMember && user?.isActive;
  const isRenter = user?.isRenter;
  const isDev = user?.isDev ?? false;

  // Handle external menu state changes
  useEffect(() => {
    if (externalIsMenuOpen !== undefined) {
      if (externalIsMenuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    }
  }, [externalIsMenuOpen]);

  const tabs: TabItem[] = [
    { name: 'Home', icon: 'home', label: 'Home', color: '#6b7280' },
    { name: 'Board', icon: 'people', label: 'Board', color: '#6b7280' },
    { name: 'Community', icon: 'chatbubbles', label: 'Community', color: '#6b7280' },
    { name: 'Covenants', icon: 'document-text', label: 'Covenants', color: '#6b7280' },
    { name: 'Emergency', icon: 'warning', label: 'Emergency', color: '#6b7280' },
    // Hide fees tab for renters and regular residents (only show for board members and dev users)
    ...(isBoardMember || isDev ? [{ name: 'Fees', icon: 'card', label: 'Fees', color: '#6b7280' }] : []),
    ...(isBoardMember || isDev ? [{ name: 'Admin', icon: 'settings', label: 'Admin', color: '#6b7280' }] : []),
  ];

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName as never);
    closeMenu();
  };

  const openMenu = () => {
    if (externalIsMenuOpen === undefined) {
      setInternalMenuOpen(true);
    }
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (externalIsMenuOpen === undefined) {
        setInternalMenuOpen(false);
      } else if (onMenuClose) {
        onMenuClose();
      }
    });
  };

  return (
    <>
      {/* Mobile Navigation Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeMenu}
          />
          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Navigation</Text>
              <TouchableOpacity onPress={closeMenu}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {tabs.map((tab) => {
                const isActive = route.name === tab.name;
                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => handleTabPress(tab.name)}
                  >
                    <View style={styles.menuItemContent}>
                      <Ionicons
                        name={tab.icon as any}
                        size={24}
                        color={isActive ? '#2563eb' : tab.color}
                      />
                      <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
                        {tab.label}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* User Info */}
            {user && (
              <View style={styles.userSection}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color="#6b7280" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.userRole}>
                      {(user.isDev ?? false) ? 'Developer' : user.isBoardMember ? 'Board Member' : user.isRenter ? 'Renter' : 'Resident'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 16,
  },
  activeMenuItemText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  userSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default MobileTabBar;
