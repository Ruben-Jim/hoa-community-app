// This file is a fallback that should not be used
// Metro will automatically use .web.tsx for web and .native.tsx for mobile
// This exists only to satisfy TypeScript

import React, { ReactNode } from 'react';

export interface StripeWrapperProps {
  children: ReactNode;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children }) => {
  console.error('Platform-specific StripeWrapper not loaded');
  return <>{children}</>;
};

export default StripeWrapper;

