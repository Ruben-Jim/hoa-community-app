// This file is a fallback that should not be used
// Metro will automatically use .web.tsx for web and .native.tsx for mobile
// This exists only to satisfy TypeScript

import React, { ReactNode } from 'react';

export interface PayPalProviderProps {
  children: ReactNode;
  clientId?: string;
  mode?: 'sandbox' | 'live';
}

export const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  console.error('Platform-specific PayPalProvider not loaded');
  return <>{children}</>;
};

export const usePayPal = () => {
  throw new Error('usePayPal must be used within a PayPalProvider');
};

export default PayPalProvider;
