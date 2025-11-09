# PayPal Integration Setup Guide

## Overview
PayPal has been successfully integrated as an additional payment method alongside Stripe. Users can now choose between Credit/Debit Card (Stripe) or PayPal when making payments.

## Environment Variables Required

### Client-Side (.env.local)
```bash
# PayPal Configuration
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
EXPO_PUBLIC_PAYPAL_MODE=sandbox  # or 'live' for production
```

### Server-Side (Convex Dashboard)
Add these environment variables in your Convex Dashboard:
- `PAYPAL_CLIENT_ID` - Your PayPal app client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal app client secret  
- `PAYPAL_MODE` - Set to 'sandbox' for testing or 'live' for production

## Getting PayPal Credentials

### 1. Create PayPal Developer Account
1. Go to https://developer.paypal.com/
2. Sign in with your PayPal account
3. Click "Create App"

### 2. Configure Your App
- **App Name**: HOA Community App
- **Merchant**: Your business account
- **Features**: Check "Accept payments"

### 3. Get Your Credentials
- **Client ID**: Use for client-side configuration
- **Client Secret**: Use for server-side configuration (Convex Dashboard)

## Testing PayPal Payments

### Test Accounts
PayPal provides test accounts for sandbox testing:
- **Buyer Account**: Use PayPal's test buyer account
- **Seller Account**: Your sandbox merchant account

### Test Payment Flow
1. Select "PayPal" as payment method
2. Click "Pay with PayPal"
3. Redirected to PayPal sandbox
4. Use test buyer credentials
5. Complete payment
6. Return to app and verify success

## Production Deployment

### 1. Switch to Live Mode
- Update `EXPO_PUBLIC_PAYPAL_MODE=live` in `.env.local`
- Update `PAYPAL_MODE=live` in Convex Dashboard
- Use live PayPal credentials

### 2. Deploy Convex Functions
```bash
npx convex deploy
```

### 3. Deploy Frontend
```bash
npm run predeploy
npm run deploy
```

## Features Implemented

✅ **Payment Method Selection**: Users can choose between Stripe and PayPal
✅ **PayPal Checkout**: Redirects to PayPal for secure payment processing
✅ **Status Tracking**: PayPal order status is tracked and updated
✅ **Database Integration**: PayPal payments are stored in the same payments table
✅ **Fee/Fine Updates**: Successful PayPal payments update fee/fine status
✅ **Cross-Platform**: Works on both web and mobile
✅ **PCI Compliance**: PayPal handles all sensitive payment data

## Architecture

### Frontend Components
- `PayPalCheckout.web.tsx` - Web PayPal integration
- `PayPalCheckout.native.tsx` - Mobile PayPal integration  
- `PaymentModal.tsx` - Updated with payment method selection
- `PayPalProvider.tsx` - PayPal context provider

### Backend Routes
- `POST /paypal` - Create PayPal order
- `POST /paypal-status` - Check order status and capture payment

### Database
- Uses existing `payments` table with `paymentMethod: "PayPal"`
- PayPal order IDs stored as `transactionId`

## Security Features

✅ **Server-Side Processing**: All PayPal API calls made from Convex backend
✅ **Environment Separation**: Client and server credentials properly separated
✅ **CORS Protection**: Proper CORS headers for cross-origin requests
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Status Verification**: Payment status verified before marking as complete

## Next Steps

The PayPal integration is now complete and ready for testing. Users can choose their preferred payment method when paying fees and fines.

For additional payment methods (Apple Pay, Google Pay), the same architecture can be extended by:
1. Adding new payment method components
2. Creating new HTTP routes in `convex/http.ts`
3. Adding new mutations in `convex/payments.ts`
4. Updating the payment method selection UI
