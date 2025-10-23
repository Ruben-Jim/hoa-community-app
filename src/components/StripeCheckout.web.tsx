import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';

interface StripeCheckoutProps {
  amount: number;
  feeType: string;
  userId: string;
  feeId?: string;
  fineId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  feeType,
  userId,
  feeId,
  fineId,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet');
      return;
    }

    if (!cardComplete) {
      onError('Please complete your card details');
      return;
    }

    if (!name || !email) {
      onError('Please provide your name and email');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent via Convex HTTP endpoint
      const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || 
                           process.env.EXPO_PUBLIC_CONVEX_URL?.replace('.convex.cloud', '.convex.site');
      
      if (!convexSiteUrl) {
        throw new Error('Convex HTTP URL not configured. Add EXPO_PUBLIC_CONVEX_SITE_URL to .env.local');
      }

      const stripeEndpoint = `${convexSiteUrl}/stripe`;
      console.log('Attempting to create payment intent at:', stripeEndpoint);
      console.log('Payment data:', { amount, userId, feeType, feeId, fineId });

      const response = await fetch(stripeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'usd',
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
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const { clientSecret } = data;

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
          },
        },
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Provide more specific error messages
      if (error.message === 'Failed to fetch') {
        onError('Cannot connect to payment server. Check that:\n1. npx convex dev is running\n2. Your .env.local has EXPO_PUBLIC_CONVEX_SITE_URL\n3. The URL ends with .convex.site');
      } else {
        onError(error.message || 'An error occurred during payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Card Details</Text>
        <View style={styles.cardElementContainer}>
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.payButton, (!cardComplete || loading) && styles.payButtonDisabled]}
        onPress={handleSubmit as any}
        disabled={!cardComplete || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay ${amount.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.secureText}>
        🔒 Secure payment powered by Stripe
      </Text>
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
  cardElementContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 40,
  },
  payButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secureText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 12,
  },
});

export default StripeCheckout;

