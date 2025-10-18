# Payment Implementation Guide

## Overview
This implementation adds dynamic fee tracking and Stripe payment integration to the HOA Community App. Each user can now view their individual fees and fines, track payment status, and make payments through Stripe.

## Features Implemented

### 1. Database Schema Updates
- **Enhanced fees table**: Added user-specific fields (`residentId`, `isPaid`, `paidAt`, `paymentMethod`, `stripePaymentIntentId`)
- **New payments table**: Tracks all payment transactions with Stripe integration
- **Updated fines table**: Added `markAsPaid` mutation for payment tracking

### 2. Dynamic Fee Management
- **User-specific queries**: Each resident sees only their own fees and fines
- **Payment status tracking**: Real-time updates when payments are made
- **Overdue detection**: Automatic identification of overdue fees and fines

### 3. Stripe Integration
- **Payment service**: `StripePaymentService` handles payment processing
- **Payment hooks**: `usePayments` hook manages payment state and operations
- **API endpoints**: Created endpoints for payment intent creation and verification

### 4. Enhanced UI
- **Real-time status**: Shows paid/unpaid status with visual indicators
- **Payment buttons**: Integrated "Pay Now" buttons with loading states
- **Payment history**: Displays when payments were made
- **Summary cards**: Shows unpaid fees, total fines, and overdue amounts

## Files Modified/Created

### Database & API
- `convex/schema.ts` - Updated with payment tracking fields
- `convex/fees.ts` - Added user-specific queries and payment mutations
- `convex/fines.ts` - Added payment tracking
- `convex/payments.ts` - New payment transaction management

### Frontend
- `src/screens/FeesScreen.tsx` - Updated to use dynamic data and Stripe payments
- `src/hooks/usePayments.ts` - Payment state management hook
- `src/services/StripePaymentService.ts` - Stripe payment processing
- `src/types/index.ts` - Added payment-related types

### API Endpoints
- `api/create-payment-intent.js` - Creates Stripe payment intents
- `api/verify-payment/[paymentIntentId].js` - Verifies payment status

## Setup Instructions

### 1. Environment Variables
Make sure you have these environment variables set:
```
STRIPE_SECRET_KEY=sk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Convex Development
Run the Convex development server to regenerate the API:
```bash
npx convex dev
```

### 3. Uncomment Payment Queries
Once the API is regenerated, uncomment the payment queries in `src/hooks/usePayments.ts`:
```typescript
// Uncomment these lines:
const payments = useQuery(
  api.payments.getByResident,
  user ? { residentId: user._id as Id<"residents"> } : "skip"
);

const paymentStats = useQuery(
  api.payments.getStatsByResident,
  user ? { residentId: user._id as Id<"residents"> } : "skip"
);

const createPayment = useMutation(api.payments.create);
const updatePaymentStatus = useMutation(api.payments.updateStatus);
```

## Usage

### For Residents
1. **View Fees**: Navigate to the Fees & Fines screen to see your individual fees
2. **Make Payments**: Click "Pay Now" on any unpaid fee or fine
3. **Track Status**: See real-time payment status and history
4. **Monitor Overdue**: Get alerts for overdue payments

### For Administrators
1. **Create Fees**: Use the fees management system to assign fees to residents
2. **Issue Fines**: Create violation fines for specific residents
3. **Monitor Payments**: Track payment status across all residents
4. **Generate Reports**: Use payment statistics for financial reporting

## Payment Flow

1. **User clicks "Pay Now"** → Confirmation dialog appears
2. **User confirms payment** → Stripe payment intent is created
3. **Payment is processed** → Stripe handles the payment
4. **Payment succeeds** → Fee/fine is marked as paid in database
5. **UI updates** → Payment status changes to "Paid" with timestamp

## Security Considerations

- **Stripe integration**: All payment processing is handled securely by Stripe
- **User isolation**: Each user can only see their own fees and payments
- **Payment verification**: All payments are verified through Stripe before marking as paid
- **Audit trail**: Complete payment history is maintained for each transaction

## Future Enhancements

- **Payment receipts**: Generate and email payment receipts
- **Recurring payments**: Set up automatic payments for monthly fees
- **Payment plans**: Allow installment payments for large fees
- **Refund handling**: Process refunds through the system
- **Financial reporting**: Advanced reporting and analytics
- **Mobile payments**: Enhanced mobile payment experience

## Troubleshooting

### Common Issues
1. **API not found**: Run `npx convex dev` to regenerate the API
2. **Payment fails**: Check Stripe keys and network connectivity
3. **Data not loading**: Ensure user is properly authenticated
4. **UI not updating**: Check if payment mutations are properly connected

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are set
3. Ensure Convex is running and API is up to date
4. Test Stripe integration with test cards
