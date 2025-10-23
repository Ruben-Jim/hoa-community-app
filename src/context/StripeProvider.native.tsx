import React, { ReactNode } from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';

interface StripeWrapperProps {
  children: ReactNode;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment variables');
    return <>{children}</>;
  }

  return (
    <StripeProviderNative publishableKey={publishableKey}>
      {children}
    </StripeProviderNative>
  );
};

export default StripeWrapper;

