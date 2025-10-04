import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import { webCompatibleAlert } from '../utils/webCompatibleAlert';

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const hoaInfo = useQuery(api.hoaInfo.get);
  const emergencyNotifications = useQuery(api.emergencyNotifications.getActive);
  const communityPosts = useQuery(api.communityPosts.getAll);

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
    webCompatibleAlert({
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require('../../assets/hoa-4k.jpg')}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.hoaName}>{hoaInfo?.name ?? 'HOA'}</Text>
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
              <BoardMemberIndicator />
            </View>
            <Text style={styles.userRole}>
              {user.isBoardMember ? 'Board Member' : 'Resident'} • {user.address}
            </Text>
          </View>
        )}
      </ImageBackground>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleContact('phone')}
        >
          <Ionicons name="call" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Call Office</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleContact('email')}
        >
          <Ionicons name="mail" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEmergency}
        >
          <Ionicons name="warning" size={24} color="#2563eb" />
          <Text style={[styles.actionText, { color: '#2563eb' }]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Active Notifications */}
      {activeNotifications.length > 0 && (
        <View style={[styles.section, styles.emergencySection]}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color="#dc2626" />
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
        </View>
      )}

      {/* Recent Community Posts */}
      <View style={styles.section}>
        <View style={styles.communityHeader}>
          <Ionicons name="people" size={24} color="#2563eb" />
          <Text style={styles.sectionTitle}>Recent Community Posts</Text>
        </View>
        {communityPosts?.slice(0, 2).map((post: any) => (
          <View key={post._id} style={styles.postCard}>
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
          </View>
        ))}
      </View>

      {/* Office Information */}
      <View style={styles.section}>
        <View style={styles.officeHeader}>
          <Ionicons name="business" size={24} color="#059669" />
          <Text style={styles.sectionTitle}>Office Information</Text>
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
      </View>
      </ScrollView>
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
    alignItems: 'flex-start',
    marginBottom: 10,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
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
    fontSize: 16,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  hoaName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    margin: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#322D2D',
    marginBottom: 15,
  },
  emergencySection: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
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
    borderLeftColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
});

export default HomeScreen; 