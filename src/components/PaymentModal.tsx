import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StripeCheckout from './StripeCheckout';
import PayPalCheckout from './PayPalCheckout';
import ApplePayCheckout from './ApplePayCheckout';
import GooglePayCheckout from './GooglePayCheckout';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  feeType: string;
  userId: string;
  description?: string;
  feeId?: string;
  fineId?: string;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  amount,
  feeType,
  userId,
  description,
  feeId,
  fineId,
  onSuccess,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'stripe' | 'paypal' | 'applepay' | 'googlepay'>('stripe');

  const handleSuccess = () => {
    setSuccess(true);
    setError(null);
    setTimeout(() => {
      onSuccess();
      onClose();
      setSuccess(false);
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setSelectedPaymentMethod('stripe');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Payment Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>{feeType}</Text>
                <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
              </View>
              {description && (
                <Text style={styles.summaryDescription}>{description}</Text>
              )}
            </View>

            {/* Success Message */}
            {success && (
              <View style={styles.successCard}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={styles.successText}>Payment Successful!</Text>
                <Text style={styles.successSubtext}>
                  Your payment has been processed
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Payment Method Selection */}
            {!success && (
              <View style={styles.paymentMethodCard}>
                <Text style={styles.paymentMethodLabel}>Choose Payment Method</Text>
                <View style={styles.paymentMethodGrid}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'stripe' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod('stripe')}
                  >
                    <Ionicons 
                      name="card" 
                      size={20} 
                      color={selectedPaymentMethod === 'stripe' ? '#2563eb' : '#6b7280'} 
                    />
                    <Text style={[
                      styles.paymentMethodText,
                      selectedPaymentMethod === 'stripe' && styles.paymentMethodTextSelected,
                    ]}>
                      Card
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'paypal' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod('paypal')}
                  >
                    <View style={styles.paypalBrandContainer}>
                      <Text style={styles.paypalBrandText}>PayPal</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'applepay' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod('applepay')}
                  >
                    <View style={styles.applePayBrandContainer}>
                      <Text style={styles.applePayBrandText}>🍎</Text>
                      <Text style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === 'applepay' && styles.paymentMethodTextSelected,
                      ]}>
                        Apple Pay
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'googlepay' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod('googlepay')}
                  >
                    <View style={styles.googlePayBrandContainer}>
                      <View style={styles.googlePayLogo}>
                        <Text style={styles.googlePayLogoText}>G</Text>
                      </View>
                      <Text style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === 'googlepay' && styles.paymentMethodTextSelected,
                      ]}>
                        Google Pay
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Stripe Checkout Form */}
            {!success && selectedPaymentMethod === 'stripe' && (
              <StripeCheckout
                amount={amount}
                feeType={feeType}
                userId={userId}
                feeId={feeId}
                fineId={fineId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {/* PayPal Checkout Form */}
            {!success && selectedPaymentMethod === 'paypal' && (
              <PayPalCheckout
                amount={amount}
                feeType={feeType}
                userId={userId}
                feeId={feeId}
                fineId={fineId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {/* Apple Pay Checkout Form */}
            {!success && selectedPaymentMethod === 'applepay' && (
              <ApplePayCheckout
                amount={amount}
                feeType={feeType}
                userId={userId}
                feeId={feeId}
                fineId={fineId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {/* Google Pay Checkout Form */}
            {!success && selectedPaymentMethod === 'googlepay' && (
              <GooglePayCheckout
                amount={amount}
                feeType={feeType}
                userId={userId}
                feeId={feeId}
                fineId={fineId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {/* Test Card Info (for development) */}
            {!success && __DEV__ && selectedPaymentMethod === 'stripe' && (
              <View style={styles.testCard}>
                <Text style={styles.testCardTitle}>Test Card:</Text>
                <Text style={styles.testCardNumber}>4242 4242 4242 4242</Text>
                <Text style={styles.testCardDetails}>Any future date • Any CVC</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  summaryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  successCard: {
    margin: 20,
    marginTop: 0,
    padding: 32,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 12,
  },
  successSubtext: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  errorCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 12,
  },
  testCard: {
    margin: 20,
    marginTop: 0,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  testCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  testCardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#78350f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  testCardDetails: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  paymentMethodCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  paymentMethodOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  paymentMethodTextSelected: {
    color: '#2563eb',
  },
  paypalBrandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalBrandText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0070ba',
    letterSpacing: 0.5,
  },
  applePayBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applePayBrandText: {
    fontSize: 16,
    marginRight: 6,
  },
  googlePayBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googlePayLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googlePayLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4285f4',
  },
});

export default PaymentModal;

