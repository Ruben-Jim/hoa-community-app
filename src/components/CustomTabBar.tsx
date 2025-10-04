import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

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

  const isBoardMember = user?.isBoardMember && user?.isActive;

  const tabs: TabItem[] = [
    { name: 'Home', icon: 'home', label: 'Home', color: '#2563eb' },
    { name: 'Board', icon: 'people', label: 'Board', color: '#059669' },
    { name: 'Community', icon: 'chatbubbles', label: 'Community', color: '#7c3aed' },
    { name: 'Covenants', icon: 'document-text', label: 'Covenants', color: '#dc2626' },
    { name: 'Emergency', icon: 'warning', label: 'Emergency', color: '#ea580c' },
    ...(isBoardMember ? [{ name: 'Admin', icon: 'settings', label: 'Admin', color: '#8b5cf6' }] : []),
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
              color={isActive ? '#ffffff' : tab.color}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#ffffff',
  },
});

export default CustomTabBar;
