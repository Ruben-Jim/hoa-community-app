import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';

const BoardScreen = () => {
  const { user } = useAuth();
  
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Board of Directors</Text>
          <BoardMemberIndicator />
        </View>
        <Text style={styles.headerSubtitle}>
          Your elected representatives serving the community
        </Text>
      </View>

      {members.map((member: any) => (
        <View key={member._id} style={styles.memberCard}>
          <View style={styles.memberHeader}>
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
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberPosition}>{member.position}</Text>
              {member.termEnd && (
                <Text style={styles.memberTerm}>
                  Term ends: {formatDate(member.termEnd)}
                </Text>
              )}
              {member.bio && (
                <Text style={styles.memberBio} numberOfLines={3}>
                  {member.bio}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.contactSection}>
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
      ))}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Board Meetings</Text>
        <Text style={styles.infoText}>
          Board meetings are held on the second Tuesday of each month at 7:00 PM in the community center.
        </Text>
        <Text style={styles.infoText}>
          Residents are welcome to attend and may request to speak during the open forum period.
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Contact the Board</Text>
        <Text style={styles.infoText}>
          For general inquiries, please contact the board secretary or use the contact information above.
        </Text>
        <Text style={styles.infoText}>
          For urgent matters, please contact the HOA office directly.
        </Text>
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberPosition: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  memberTerm: {
    fontSize: 14,
    color: '#6b7280',
  },
  memberBio: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default BoardScreen; 