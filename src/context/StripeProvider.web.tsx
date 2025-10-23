import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeWrapperProps {
  children: ReactNode;
}

// Initialize Stripe for web
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment variables');
    return <>{children}</>;
  }

  const stripe = getStripe();
  return stripe ? (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  ) : (
    <>{children}</>
  );
};

export default StripeWrapper;

