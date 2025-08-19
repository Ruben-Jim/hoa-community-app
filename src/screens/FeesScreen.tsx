import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fees as feesSample, fines as finesSample } from '../data/sampleData';

const FeesScreen = () => {
  const [activeTab, setActiveTab] = useState<'fees' | 'fines'>('fees');

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

  const fees = feesSample.map((f: any) => ({ ...f, _id: f.id ?? f._id ?? Math.random().toString() }));
  const fines = finesSample.map((f: any) => ({ ...f, _id: f.id ?? f._id ?? Math.random().toString() }));
  const totalFees = fees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
  const totalFines = fines.reduce((sum: number, fine: any) => sum + fine.amount, 0);
  const overdueFines = fines.filter((fine: any) => fine.status === 'Overdue').reduce((sum: number, fine: any) => sum + fine.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Summary Cards */}
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

      {/* Tab Navigation */}
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

      {/* Content */}
      {activeTab === 'fees' ? (
        <View style={styles.contentContainer}>
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
        <View style={styles.contentContainer}>
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

      {/* Payment Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Payment Information</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
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
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2563eb',
  },
  contentContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: 6,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 6,
  },
});

export default FeesScreen; 