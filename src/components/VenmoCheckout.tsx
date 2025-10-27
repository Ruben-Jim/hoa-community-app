import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import QRCode from 'react-native-qrcode-svg';
import { Id } from '../../convex/_generated/dataModel';

interface VenmoCheckoutProps {
  amount: number;
  feeType: string;
  userId: string;
  feeId?: Id<"fees">;
  fineId?: Id<"fines">;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const VenmoCheckout: React.FC<VenmoCheckoutProps> = ({
  amount,
  feeType,
  userId,
  feeId,
  fineId,
  onSuccess,
  onError,
}) => {
  const createVenmoPayment = useMutation(api.payments.createVenmoPayment);
  const [venmoUsername, setVenmoUsername] = useState('');
  const [venmoTransactionId, setVenmoTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const hoaVenmoUsername = '@SheltonSprings-HOA';
  
  // Generate Venmo web URL for business profile
  const venmoWebLink = `https://venmo.com/${hoaVenmoUsername.replace('@', '')}`;
  
  // Generate QR code URL for Venmo payment to business profile
  const qrCodeValue = `https://venmo.com/${hoaVenmoUsername.replace('@', '')}`;

  const openVenmo = () => {
    // Open Venmo business profile page on all platforms
    Linking.openURL(venmoWebLink).catch(() => {
      Alert.alert('Error', 'Could not open Venmo. Please visit the profile manually or scan the QR code.');
      setShowQR(true);
    });
  };

  const handleSubmit = async () => {
    if (!venmoUsername.trim()) {
      onError('Please enter your Venmo username');
      return;
    }

    if (!venmoTransactionId.trim()) {
      onError('Please enter your Venmo transaction ID');
      return;
    }

    setLoading(true);

    try {
      // Create Venmo payment record
      await createVenmoPayment({
        userId,
        feeType,
        amount,
        venmoUsername: venmoUsername.trim(),
        venmoTransactionId: venmoTransactionId.trim(),
        feeId,
        fineId,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Venmo payment submission error:', error);
      onError(error.message || 'Failed to submit payment information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Compact Instructions Card at Top */}
      <View style={styles.afterPaymentCard}>
        <View style={styles.afterPaymentHeader}>
          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
          <Text style={styles.afterPaymentTitle}>Next Steps</Text>
        </View>
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Click "Open Venmo" button</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Complete payment</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Enter details below</Text>
          </View>
        </View>
      </View>

      {/* QR Code Option */}
      <TouchableOpacity
        style={styles.qrToggleButton}
        onPress={() => setShowQR(!showQR)}
      >
        <Ionicons name={showQR ? "qr-code-outline" : "qr-code"} size={20} color="#008CFF" />
        <Text style={styles.qrToggleText}>
          {showQR ? 'Hide' : 'Show'} QR Code
        </Text>
      </TouchableOpacity>

      {showQR && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>Scan with Venmo App</Text>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrCodeValue}
              size={200}
              color="#000000"
              backgroundColor="#ffffff"
            />
          </View>
        </View>
      )}

      {/* Open Venmo Button */}
      <TouchableOpacity
        style={styles.openVenmoButton}
        onPress={openVenmo}
      >
        <Ionicons name="logo-venmo" size={24} color="#ffffff" />
        <Text style={styles.openVenmoText}>Open Venmo</Text>
      </TouchableOpacity>

      <View style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
        <Text style={styles.noteText}>
          Click "Open Venmo" to pay directly through our business profile
        </Text>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>After Payment</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Venmo Username</Text>
        <TextInput
          style={styles.input}
          placeholder="YourVenmoUsername"
          value={venmoUsername}
          onChangeText={setVenmoUsername}
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Venmo Transaction ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Copy from your Venmo receipt"
          value={venmoTransactionId}
          onChangeText={setVenmoTransactionId}
          autoCapitalize="none"
          editable={!loading}
        />
        <Text style={styles.helperText}>After completing payment, paste the transaction ID from your Venmo receipt</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Payment Info</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  instructionsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginTop: 8,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#008CFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    lineHeight: 16,
  },
  venmoUsername: {
    fontWeight: 'bold',
    color: '#008CFF',
  },
  qrToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  qrToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008CFF',
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  qrCodeContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  openVenmoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008CFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  openVenmoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  afterPaymentCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  afterPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  afterPaymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 13,
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
});

export default VenmoCheckout;

