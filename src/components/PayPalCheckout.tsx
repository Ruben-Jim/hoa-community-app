// This file is a fallback that should not be used
// Metro will automatically use .web.tsx for web and .native.tsx for mobile
// This exists only to satisfy TypeScript

import React from 'react';

export interface PayPalCheckoutProps {
  amount: number;
  feeType: string;
  userId: string;
  feeId?: string;
  fineId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = () => {
  console.error('Platform-specific PayPalCheckout not loaded');
  return null;
};

export default PayPalCheckout;
