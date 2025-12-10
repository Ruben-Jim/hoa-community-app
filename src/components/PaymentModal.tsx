import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Circle, Rect, Text as SvgText } from 'react-native-svg';
import VenmoCheckout from './VenmoCheckout';
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

type PaymentMethod = 'apple' | 'google' | 'paypal' | 'stripe' | 'venmo' | null;

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  const handleSuccess = () => {
    setSuccess(true);
    setError(null);
    setTimeout(() => {
      onSuccess();
      onClose();
      setSuccess(false);
    }, 10000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setSelectedMethod(null);
    onClose();
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handlePayPalPayment = async () => {
    // Demo: Simulate PayPal payment
    setTimeout(() => {
      handleSuccess();
    }, 2000);
  };

  const handleStripePayment = async () => {
    // Demo: Simulate Stripe payment
    setTimeout(() => {
      handleSuccess();
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
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
                <Text style={styles.successText}>Payment Info Submitted!</Text>
                <Text style={styles.successSubtext}>
                  Your payment information has been received
                </Text>
                <Text style={styles.successSubtext}>
                  The HOA treasurer will review and verify your payment
                </Text>
                <Text style={styles.successSubtext}>
                  You will be notified once it's approved or rejected
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
            {!success && !selectedMethod && (
              <View style={styles.paymentMethodsContainer}>
                <Text style={styles.methodsTitle}>Select Payment Method</Text>
                <Text style={styles.methodsSubtitle}>Choose how you'd like to pay</Text>
                
                <View style={styles.methodsGrid}>
                  {/* Apple Pay */}
                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect('apple')}
                  >
                    <View style={styles.methodLogoContainer}>
                      <View style={[styles.logoWrapper, styles.appleLogoWrapper]}>
                        <Svg width={56} height={24} viewBox="0 0 100 40">
                          <Rect x={0} y={0} width={100} height={40} rx={6} fill="#000000" />
                          <SvgText x={50} y={26} fontSize="10" fill="#FFFFFF" fontWeight="600" textAnchor="middle">
                            Apple Pay
                          </SvgText>
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.methodName}>Apple Pay</Text>
                    <Text style={styles.methodDescription}>Pay with Face ID or Touch ID</Text>
                  </TouchableOpacity>

                  {/* Google Pay */}
                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect('google')}
                  >
                    <View style={styles.methodLogoContainer}>
                      <View style={[styles.logoWrapper, styles.googleLogoWrapper]}>
                        <Svg width={56} height={24} viewBox="0 0 100 40">
                          <Circle cx={20} cy={20} r={18} fill="#4285F4" />
                          <SvgText x={20} y={26} fontSize="14" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
                            G
                          </SvgText>
                          <SvgText x={45} y={26} fontSize="10" fill="#5F6368" fontWeight="500">
                            Pay
                          </SvgText>
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.methodName}>Google Pay</Text>
                    <Text style={styles.methodDescription}>Quick and secure</Text>
                  </TouchableOpacity>

                  {/* PayPal */}
                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect('paypal')}
                  >
                    <View style={styles.methodLogoContainer}>
                      <View style={[styles.logoWrapper, styles.paypalLogoWrapper]}>
                        <Svg width={56} height={24} viewBox="0 0 100 40">
                          <Rect x={0} y={0} width={100} height={40} rx={4} fill="#0070BA" />
                          <SvgText x={50} y={26} fontSize="11" fill="#FFFFFF" fontWeight="700" textAnchor="middle">
                            PayPal
                          </SvgText>
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.methodName}>PayPal</Text>
                    <Text style={styles.methodDescription}>Pay with your account</Text>
                  </TouchableOpacity>

                  {/* Stripe (Credit Card) */}
                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect('stripe')}
                  >
                    <View style={styles.methodLogoContainer}>
                      <View style={[styles.logoWrapper, styles.stripeLogoWrapper]}>
                        <Svg width={56} height={24} viewBox="0 0 100 40">
                          <Rect x={0} y={0} width={100} height={40} rx={4} fill="#635BFF" />
                          <SvgText x={50} y={26} fontSize="11" fill="#FFFFFF" fontWeight="600" textAnchor="middle">
                            Stripe
                          </SvgText>
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.methodName}>Credit Card</Text>
                    <Text style={styles.methodDescription}>Visa, Mastercard, etc.</Text>
                  </TouchableOpacity>

                  {/* Venmo */}
                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleMethodSelect('venmo')}
                  >
                    <View style={styles.methodLogoContainer}>
                      <View style={[styles.logoWrapper, styles.venmoLogoWrapper]}>
                        <Svg width={56} height={24} viewBox="0 0 100 40">
                          <Rect x={0} y={0} width={100} height={40} rx={4} fill="#3D95CE" />
                          <SvgText x={50} y={26} fontSize="11" fill="#FFFFFF" fontWeight="700" textAnchor="middle">
                            Venmo
                          </SvgText>
                        </Svg>
                      </View>
                    </View>
                    <Text style={styles.methodName}>Venmo</Text>
                    <Text style={styles.methodDescription}>Manual tracking</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Payment Method Checkouts */}
            {!success && selectedMethod === 'apple' && (
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

            {!success && selectedMethod === 'google' && (
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

            {!success && selectedMethod === 'paypal' && (
              <View style={styles.checkoutContainer}>
                <TouchableOpacity
                  style={styles.paypalButton}
                  onPress={handlePayPalPayment}
                >
                  <Text style={styles.paypalButtonText}>Pay with PayPal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedMethod(null)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6b7280" />
                  <Text style={styles.backButtonText}>Back to methods</Text>
                </TouchableOpacity>
              </View>
            )}

            {!success && selectedMethod === 'stripe' && (
              <View style={styles.checkoutContainer}>
                <TouchableOpacity
                  style={styles.stripeButton}
                  onPress={handleStripePayment}
                >
                  <Ionicons name="card" size={20} color="#ffffff" />
                  <Text style={styles.stripeButtonText}>Pay with Credit Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedMethod(null)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6b7280" />
                  <Text style={styles.backButtonText}>Back to methods</Text>
                </TouchableOpacity>
              </View>
            )}

            {!success && selectedMethod === 'venmo' && (
              <View>
                <VenmoCheckout
                  amount={amount}
                  feeType={feeType}
                  userId={userId}
                  feeId={feeId}
                  fineId={fineId}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
                <View style={styles.checkoutContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedMethod(null)}
                  >
                    <Ionicons name="arrow-back" size={20} color="#6b7280" />
                    <Text style={styles.backButtonText}>Back to methods</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
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
    padding: Platform.OS === 'ios' ? 20 : 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: Platform.OS === 'ios' ? '95%' : '100%',
    maxWidth: 500,
    maxHeight: Platform.OS === 'ios' ? '85%' : '90%',
    height: Platform.OS === 'ios' ? '85%' : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
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
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
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
  paymentMethodsContainer: {
    padding: 20,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  methodsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  methodCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  methodLogoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 32,
  },
  logoWrapper: {
    width: 56,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  appleLogoWrapper: {
    // Apple Pay uses black background
  },
  googleLogoWrapper: {
    // Google Pay uses blue circle
  },
  paypalLogoWrapper: {
    // PayPal uses blue background
  },
  stripeLogoWrapper: {
    // Stripe uses purple background
  },
  venmoLogoWrapper: {
    // Venmo uses blue background
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  methodDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  checkoutContainer: {
    padding: 20,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paypalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stripeButton: {
    backgroundColor: '#635BFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stripeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default PaymentModal;

