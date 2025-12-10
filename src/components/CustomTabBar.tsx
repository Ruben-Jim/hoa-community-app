import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import MessagingButton from './MessagingButton';
import { useMessaging } from '../context/MessagingContext';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

interface TabItem {
  name: string;
  icon: string;
  label: string;
  color: string;
}

const CustomTabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { setShowOverlay } = useMessaging();

  const isBoardMember = user?.isBoardMember && user?.isActive;
  const isRenter = user?.isRenter;
  const isDev = user?.isDev ?? false;

  // Hide tab bar on mobile devices
  if (isMobile) {
    return null;
  }

  const tabs: TabItem[] = [
    { name: 'Home', icon: 'home', label: 'Home', color: '#6b7280' },
    { name: 'Board', icon: 'people', label: 'Board', color: '#6b7280' },
    { name: 'Community', icon: 'chatbubbles', label: 'Community', color: '#6b7280' },
    // { name: 'ResidentNotifications', icon: 'home', label: 'Residents', color: '#6b7280' },
    { name: 'Covenants', icon: 'document-text', label: 'Covenants', color: '#6b7280' },
    { name: 'Documents', icon: 'folder', label: 'Documents', color: '#6b7280' },
    // Hide fees tab for renters and regular residents (only show for board members and dev users)
    ...(isBoardMember || !isRenter ? [{ name: 'Fees', icon: 'card', label: 'Fees', color: '#6b7280' }] : []),
    ...(isBoardMember || isDev ? [{ name: 'Admin', icon: 'settings', label: 'Admin', color: '#6b7280' }] : []),
  ];

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName as never);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => handleTabPress(tab.name)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={isActive ? '#1e293b' : tab.color}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {isBoardMember && (
        <View style={styles.messagingButtonContainer}>
          <MessagingButton onPress={() => setShowOverlay(true)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 16,
    padding: 6,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' as any,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#f8fbfe',
    borderColor: '#64748b',
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' as any,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#1e293b',
    fontWeight: '600',
  },
  messagingButtonContainer: {
    marginLeft: 'auto',
    paddingLeft: 16,
  },
});

export default CustomTabBar;
