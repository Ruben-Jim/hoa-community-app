// PayPal Provider for Mobile (Native)
import React, { createContext, useContext, ReactNode } from 'react';

interface PayPalContextType {
  clientId?: string;
  mode: 'sandbox' | 'live';
}

const PayPalContext = createContext<PayPalContextType>({
  mode: 'sandbox',
});

interface PayPalProviderProps {
  children: ReactNode;
  clientId?: string;
  mode?: 'sandbox' | 'live';
}

export const PayPalProvider: React.FC<PayPalProviderProps> = ({
  children,
  clientId,
  mode = 'sandbox',
}) => {
  const value: PayPalContextType = {
    clientId,
    mode,
  };

  return (
    <PayPalContext.Provider value={value}>
      {children}
    </PayPalContext.Provider>
  );
};

export const usePayPal = () => {
  const context = useContext(PayPalContext);
  if (!context) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
};

export default PayPalProvider;
