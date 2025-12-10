// Google Pay Checkout Component for Web
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface GooglePayCheckoutProps {
  amount: number;
  feeType: string;
  userId: string;
  feeId?: string;
  fineId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const GooglePayCheckout: React.FC<GooglePayCheckoutProps> = ({
  amount,
  feeType,
  userId,
  feeId,
  fineId,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGooglePayPayment = async () => {
    setLoading(true);
    
    try {
      // TODO: Implement Google Pay integration
      // For now, simulate a successful payment
      setTimeout(() => {
        onSuccess();
        setLoading(false);
      }, 2000);
      
      // Future implementation will use Google Pay API:
      // 1. Check if Google Pay is available
      // 2. Create payment data request
      // 3. Present Google Pay sheet
      // 4. Process payment token
      // 5. Handle success/failure callbacks
      
    } catch (error) {
      console.error('Google Pay payment error:', error);
      onError('Google Pay is not available. Please try another payment method.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.googlePayButton, loading && styles.googlePayButtonDisabled]}
        onPress={handleGooglePayPayment}
        disabled={loading}
      >
        <View style={styles.googlePayButtonContent}>
          <View style={styles.googlePayLogoContainer}>
            <Text style={styles.googlePayLogoText}>G</Text>
          </View>
          <Text style={styles.googlePayButtonText}>
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.googlePayTrustBadge}>
        <Text style={styles.trustText}>🔒 Secured by Google</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  googlePayButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  googlePayButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  googlePayButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googlePayLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googlePayLogoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googlePayButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googlePayTrustBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  trustText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default GooglePayCheckout;
