import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';

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
  const { confirmPayment, loading } = useConfirmPayment();
  const [cardComplete, setCardComplete] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handlePayment = async () => {
    if (!cardComplete) {
      onError('Please complete your card details');
      return;
    }

    if (!name || !email) {
      onError('Please provide your name and email');
      return;
    }

    try {
      // Create payment intent via Convex HTTP endpoint
      const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || 
                           process.env.EXPO_PUBLIC_CONVEX_URL?.replace('.convex.cloud', '.convex.site');
      
      if (!convexSiteUrl) {
        throw new Error('Convex HTTP URL not configured. Add EXPO_PUBLIC_CONVEX_SITE_URL to .env.local');
      }

      const response = await fetch(`${convexSiteUrl}/stripe`, {
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
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name,
            email,
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'Succeeded') {
        onSuccess();
      }
    } catch (error: any) {
      onError(error.message || 'An error occurred during payment');
    }
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
        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={{
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
          }}
          style={styles.cardField}
          onCardChange={(cardDetails) => {
            setCardComplete(cardDetails.complete);
          }}
        />
      </View>

      <TouchableOpacity
        style={[styles.payButton, (!cardComplete || loading) && styles.payButtonDisabled]}
        onPress={handlePayment}
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
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
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

