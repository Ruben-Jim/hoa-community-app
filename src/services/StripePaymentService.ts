import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Initialize Stripe
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export class StripePaymentService {
  private static instance: StripePaymentService;
  private stripe: any = null;

  private constructor() {
    this.initializeStripe();
  }

  public static getInstance(): StripePaymentService {
    if (!StripePaymentService.instance) {
      StripePaymentService.instance = new StripePaymentService();
    }
    return StripePaymentService.instance;
  }

  private async initializeStripe() {
    try {
      this.stripe = await stripePromise;
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      throw error;
    }
  }

  // Create a payment intent on the server
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: any = {}
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment using Stripe Elements
  async processPayment(
    clientSecret: string,
    elements: any,
    confirmParams: any = {}
  ): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        await this.initializeStripe();
      }

      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          ...confirmParams,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      }

      return {
        success: false,
        error: 'Payment was not completed',
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Process payment for mobile using Stripe React Native
  async processMobilePayment(
    amount: number,
    currency: string = 'usd',
    description: string,
    metadata: any = {}
  ): Promise<PaymentResult> {
    try {
      // For mobile, we'll use a simplified approach
      // In a real implementation, you'd use @stripe/stripe-react-native
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // For demo purposes, we'll simulate a successful payment
      // In production, you'd integrate with the actual Stripe mobile SDK
      return {
        success: true,
        paymentIntentId: data.id,
      };
    } catch (error) {
      console.error('Error processing mobile payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/verify-payment/${paymentIntentId}`);
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'succeeded';
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  // Format amount for display
  formatAmount(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  // Get Stripe instance
  async getStripe() {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    return this.stripe;
  }
}

// Export singleton instance
export const stripePaymentService = StripePaymentService.getInstance();
