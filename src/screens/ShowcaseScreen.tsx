import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  hoaInfo,
  boardMembers,
  covenants,
  communityPosts,
  emergencyNotifications,
  fees,
  fines,
} from '../data/sampleData';

const ShowcaseScreen = () => {
  const activeAlerts = emergencyNotifications.filter((n) => n.isActive);

  const formatDate = (value: string) => new Date(value).toLocaleDateString();
  const formatDateTime = (value: string) => new Date(value).toLocaleString();
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
          <Text style={styles.headerWelcome}>Welcome to</Text>
          <Text style={styles.headerTitle}>{hoaInfo.name}</Text>
          <Text style={styles.headerSubtitle}>Community Showcase</Text>
        </LinearGradient>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${hoaInfo.phone}`)}>
            <Ionicons name="call" size={22} color="#2563eb" />
            <Text style={styles.actionText}>Call Office</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`mailto:${hoaInfo.email}`)}>
            <Ionicons name="mail" size={22} color="#2563eb" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${hoaInfo.emergencyContact}`)}>
            <Ionicons name="warning" size={22} color="#dc2626" />
            <Text style={[styles.actionText, { color: '#dc2626' }]}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {activeAlerts.map((a) => (
              <View key={a.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Ionicons name={a.priority === 'High' ? 'warning' : a.priority === 'Medium' ? 'information-circle' : 'checkmark-circle'} size={20} color={a.priority === 'High' ? '#dc2626' : a.priority === 'Medium' ? '#f59e0b' : '#10b981'} />
                  <Text style={styles.alertTitle}>{a.title}</Text>
                </View>
                <Text style={styles.alertContent}>{a.content}</Text>
                <Text style={styles.alertMeta}>{a.type} • {a.category} • {formatDateTime(a.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Board Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Board of Directors</Text>
          {boardMembers.map((m) => (
            <View key={m.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}><Ionicons name="person" size={28} color="#6b7280" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{m.name}</Text>
                  <Text style={styles.badgePrimary}>{m.position}</Text>
                  <Text style={styles.meta}>Term ends {formatDate(m.termEnd)}</Text>
                </View>
              </View>
              <View style={styles.rowBetween}>
                <TouchableOpacity style={styles.iconRow} onPress={() => Linking.openURL(`tel:${m.phone}`)}>
                  <Ionicons name="call" size={18} color="#2563eb" />
                  <Text style={styles.iconText}>{m.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconRow} onPress={() => Linking.openURL(`mailto:${m.email}`)}>
                  <Ionicons name="mail" size={18} color="#2563eb" />
                  <Text style={styles.iconText}>{m.email}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Covenants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Covenants</Text>
          {covenants.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.badge}>{c.category}</Text>
              </View>
              <Text style={styles.body}>{c.description}</Text>
              <Text style={styles.meta}>Last updated {formatDate(c.lastUpdated)}</Text>
            </View>
          ))}
        </View>

        {/* Community Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Posts</Text>
          {communityPosts.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.iconRow}>
                  <View style={styles.smallAvatar}><Ionicons name="person" size={16} color="#6b7280" /></View>
                  <View>
                    <Text style={styles.author}>{p.author}</Text>
                    <Text style={styles.meta}>{formatDateTime(p.timestamp)}</Text>
                  </View>
                </View>
                <Text style={styles.badge}>{p.category}</Text>
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.body}>{p.content}</Text>
              <View style={styles.row}>
                <View style={styles.iconRow}><Ionicons name="heart" size={14} color="#6b7280" /><Text style={styles.metaStrong}>{p.likes}</Text></View>
                <View style={[styles.iconRow, { marginLeft: 12 }]}><Ionicons name="chatbubble" size={14} color="#6b7280" /><Text style={styles.metaStrong}>{p.comments.length}</Text></View>
              </View>
            </View>
          ))}
        </View>

        {/* Fees & Fines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fees & Fines</Text>
          <View style={styles.row}>
            <View style={[styles.statCard, { marginRight: 8 }]}>
              <Text style={styles.statLabel}>Total Fees</Text>
              <Text style={styles.statValue}>{money(fees.reduce((s, f) => s + f.amount, 0))}</Text>
              <Text style={styles.meta}>{fees.length} items</Text>
            </View>
            <View style={[styles.statCard, { marginLeft: 8 }]}>
              <Text style={styles.statLabel}>Total Fines</Text>
              <Text style={styles.statValue}>{money(fines.reduce((s, f) => s + f.amount, 0))}</Text>
              <Text style={styles.meta}>{fines.length} items</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Upcoming Fees</Text>
          {fees.map((f) => (
            <View key={f.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{f.name}</Text>
                <Text style={styles.badge}>{f.frequency}</Text>
              </View>
              <Text style={styles.body}>{f.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Due {formatDate(f.dueDate)}</Text>
                <Text style={styles.metaStrong}>{money(f.amount)}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>Recent Fines</Text>
          {fines.map((fi) => (
            <View key={fi.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{fi.violation}</Text>
                <Text style={styles.badge}>{fi.status}</Text>
              </View>
              <Text style={styles.body}>{fi.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Issued {formatDate(fi.dateIssued)} • Due {formatDate(fi.dueDate)}</Text>
                <Text style={styles.metaStrong}>{money(fi.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Office Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOA Office</Text>
          <View style={styles.card}>
            <View style={styles.iconRow}><Ionicons name="location" size={18} color="#6b7280" /><Text style={styles.body}>{hoaInfo.address}</Text></View>
            <View style={styles.iconRow}><Ionicons name="time" size={18} color="#6b7280" /><Text style={styles.body}>{hoaInfo.officeHours}</Text></View>
            <View style={styles.iconRow}><Ionicons name="call" size={18} color="#6b7280" /><Text style={styles.body}>{hoaInfo.phone}</Text></View>
            <View style={styles.iconRow}><Ionicons name="mail" size={18} color="#6b7280" /><Text style={styles.body}>{hoaInfo.email}</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 28,
  },
  headerWelcome: {
    color: '#ffffff',
    opacity: 0.9,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.85,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 6,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#1f2937',
  },
  alertContent: {
    color: '#4b5563',
    marginBottom: 6,
  },
  alertMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  body: {
    color: '#4b5563',
    marginTop: 6,
    lineHeight: 20,
  },
  badge: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  badgePrimary: {
    fontSize: 12,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 6,
    color: '#374151',
  },
  meta: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  metaStrong: {
    color: '#374151',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default ShowcaseScreen;


