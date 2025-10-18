import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { stripePaymentService, PaymentResult } from '../services/StripePaymentService';
import { useAuth } from '../context/AuthContext';

export interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
}

export const usePayments = () => {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    success: false,
  });

  // Convex mutations - TODO: Uncomment when payments API is regenerated
  // const createPayment = useMutation(api.payments.create);
  // const updatePaymentStatus = useMutation(api.payments.updateStatus);
  const markFeeAsPaid = useMutation(api.fees.markAsPaid);
  const markFineAsPaid = useMutation(api.fines.markAsPaid);

  // Queries - TODO: Uncomment when payments API is regenerated
  // const payments = useQuery(
  //   api.payments.getByResident,
  //   user ? { residentId: user._id as Id<"residents"> } : "skip"
  // );
  
  // const paymentStats = useQuery(
  //   api.payments.getStatsByResident,
  //   user ? { residentId: user._id as Id<"residents"> } : "skip"
  // );

  // Temporary mock data until API is regenerated
  const payments: any[] = [];
  const paymentStats = {
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
  };

  const resetPaymentState = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      error: null,
      success: false,
    });
  }, []);

  const processFeePayment = useCallback(async (
    feeId: Id<"fees">,
    amount: number,
    description: string
  ): Promise<PaymentResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setPaymentState({
      isProcessing: true,
      error: null,
      success: false,
    });

    try {
      // Process payment with Stripe
      const paymentResult = await stripePaymentService.processMobilePayment(
        amount,
        'usd',
        description,
        {
          feeId,
          residentId: user._id,
        }
      );

      if (paymentResult.success && paymentResult.paymentIntentId) {
        // Mark fee as paid
        await markFeeAsPaid({
          id: feeId,
          paymentMethod: 'stripe',
          stripePaymentIntentId: paymentResult.paymentIntentId,
        });

        setPaymentState({
          isProcessing: false,
          error: null,
          success: true,
        });

        return paymentResult;
      } else {
        setPaymentState({
          isProcessing: false,
          error: paymentResult.error || 'Payment failed',
          success: false,
        });

        return paymentResult;
      }
    } catch (error) {
      console.error('Error processing fee payment:', error);
      setPaymentState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      });
      throw error;
    }
  }, [user, markFeeAsPaid]);

  const processFinePayment = useCallback(async (
    fineId: Id<"fines">,
    amount: number,
    description: string
  ): Promise<PaymentResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setPaymentState({
      isProcessing: true,
      error: null,
      success: false,
    });

    try {
      // Process payment with Stripe
      const paymentResult = await stripePaymentService.processMobilePayment(
        amount,
        'usd',
        description,
        {
          fineId,
          residentId: user._id,
        }
      );

      if (paymentResult.success && paymentResult.paymentIntentId) {
        // Mark fine as paid
        await markFineAsPaid({
          id: fineId,
          status: 'Paid',
        });

        setPaymentState({
          isProcessing: false,
          error: null,
          success: true,
        });

        return paymentResult;
      } else {
        setPaymentState({
          isProcessing: false,
          error: paymentResult.error || 'Payment failed',
          success: false,
        });

        return paymentResult;
      }
    } catch (error) {
      console.error('Error processing fine payment:', error);
      setPaymentState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      });
      throw error;
    }
  }, [user, markFineAsPaid]);

  return {
    paymentState,
    payments,
    paymentStats,
    processFeePayment,
    processFinePayment,
    resetPaymentState,
  };
};
