// PayPal Checkout Component for Web
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface PayPalCheckoutProps {
  amount: number;
  feeType: string;
  userId: string;
  feeId?: string;
  fineId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  feeType,
  userId,
  feeId,
  fineId,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setLoading(true);
    
    try {
      // Get Convex HTTP URL
      const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || 
                           process.env.EXPO_PUBLIC_CONVEX_URL?.replace('.convex.cloud', '.convex.site');
      
      if (!convexSiteUrl) {
        throw new Error('Convex HTTP URL not configured. Add EXPO_PUBLIC_CONVEX_SITE_URL to .env.local');
      }

      const paypalEndpoint = `${convexSiteUrl}/paypal`;
      console.log('Attempting to create PayPal order at:', paypalEndpoint);
      console.log('Payment data:', { amount, userId, feeType, feeId, fineId });

      const response = await fetch(paypalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          userId,
          feeType,
          feeId,
          fineId,
        }),
      });

      // Check if response has content
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Server returned empty response. Make sure Convex functions are deployed.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error(`Server error: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      // Redirect to PayPal for payment
      if (data.approvalUrl) {
        // Open PayPal in new window/tab
        const paypalWindow = window.open(data.approvalUrl, '_blank', 'width=600,height=700');
        
        if (!paypalWindow) {
          throw new Error('Please allow popups to complete PayPal payment');
        }

        // Listen for PayPal completion
        const checkClosed = setInterval(() => {
          if (paypalWindow.closed) {
            clearInterval(checkClosed);
            // Check payment status
            checkPaymentStatus(data.orderId);
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          if (!paypalWindow.closed) {
            paypalWindow.close();
            clearInterval(checkClosed);
            onError('Payment timed out. Please try again.');
          }
        }, 600000);

      } else {
        throw new Error('No PayPal approval URL received');
      }

    } catch (error) {
      console.error('PayPal payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || 
                           process.env.EXPO_PUBLIC_CONVEX_URL?.replace('.convex.cloud', '.convex.site');
      
      const statusEndpoint = `${convexSiteUrl}/paypal-status`;
      
      const response = await fetch(statusEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'COMPLETED') {
        onSuccess();
      } else {
        onError('Payment was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      onError('Unable to verify payment. Please contact support.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.paypalButton, loading && styles.paypalButtonDisabled]}
        onPress={handlePayPalPayment}
        disabled={loading}
      >
        <View style={styles.paypalButtonContent}>
          <View style={styles.paypalLogoContainer}>
            <Text style={styles.paypalLogoText}>PayPal</Text>
          </View>
          <Text style={styles.paypalButtonText}>
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.paypalTrustBadge}>
        <Text style={styles.trustText}>🔒 Protected by PayPal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  paypalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  paypalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalLogoContainer: {
    marginRight: 8,
  },
  paypalLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  paypalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  paypalTrustBadge: {
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

export default PayPalCheckout;
