# Stripe Implementation Archive

This document archives the Stripe payment processing implementation that was used in the HOA Community App.

## Overview

Stripe was originally integrated as the primary payment processing solution for fees and fines. The implementation included:

- Stripe Payment Intents API for secure payment processing
- Webhook handling for payment confirmation
- Multi-platform support (web, iOS, Android)
- Admin payment verification

## Key Components

### Backend (Convex)

**File: `convex/http.ts`**
- POST `/stripe` - Creates payment intent via Stripe API
  - Validates amount (minimum $0.50)
  - Creates Stripe payment intent
  - Stores payment record in Convex database
  - Returns client secret for frontend confirmation

- POST `/stripe-webhook` - Handles Stripe webhook events
  - Verifies webhook signature
  - Processes `payment_intent.succeeded` events
  - Processes `payment_intent.payment_failed` events
  - Updates payment status in database

**File: `convex/payments.ts`**
- `createPaymentIntent` mutation - Creates payment record
  - Args: userId, feeType, amount, paymentIntentId, feeId, fineId
  - Creates payment record with "Pending" status
  - Links to fee or fine if applicable

- `updatePaymentStatus` mutation - Updates payment after webhook
  - Args: paymentIntentId, status
  - Updates payment status to "Paid", "Pending", or "Overdue"
  - Updates associated fee/fine status if payment succeeded

### Frontend Components

**Files:**
- `src/components/StripeCheckout.tsx` - Base component (fallback)
- `src/components/StripeCheckout.web.tsx` - Web platform implementation
- `src/components/StripeCheckout.native.tsx` - Mobile platform implementation

**Key Features:**
- Card element integration (`@stripe/react-stripe-js` for web, `@stripe/stripe-react-native` for mobile)
- Payment intent creation via Convex HTTP endpoint
- Payment confirmation with Stripe
- Error handling and user feedback

**Provider:**
- `src/context/StripeProvider.tsx` - Base provider (fallback)
- `src/context/StripeProvider.web.tsx` - Web platform provider (Elements)
- `src/context/StripeProvider.native.tsx` - Mobile platform provider

**Integration:**
- `src/components/PaymentModal.tsx` - Payment method selection UI
- `App.tsx` - Provider wrapper setup

### Database Schema

**File: `convex/schema.ts`**
```typescript
payments: defineTable({
  userId: v.string(),
  feeType: v.string(),
  amount: v.number(),
  paymentDate: v.string(),
  status: v.union(
    v.literal("Pending"),
    v.literal("Paid"),
    v.literal("Overdue")
  ),
  paymentMethod: v.union(
    v.literal("Stripe"),
    v.literal("PayPal"),
    v.literal("ApplePay"),
    v.literal("GooglePay")
  ),
  transactionId: v.string(),             // Stripe payment_intent ID
  paymentIntentId: v.optional(v.string()), // Stripe-specific
  feeId: v.optional(v.id("fees")),
  fineId: v.optional(v.id("fines")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Environment Variables

- `STRIPE_KEY` - Stripe secret key (backend)
- `STRIPE_WEBHOOKS_SECRET` - Webhook signing secret
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)

## Payment Flow

1. User clicks "Pay Now" on fee/fine
2. PaymentModal opens with Stripe as selected payment method
3. User enters card details
4. Frontend creates payment intent via Convex HTTP endpoint
5. Convex creates Stripe payment intent and stores record
6. Frontend confirms payment with Stripe using client secret
7. Stripe webhook notifies Convex of payment status
8. Convex updates payment and fee/fine status

## Transaction Fees

Stripe charges 2.9% + $0.30 per transaction, which was considered too high for HOA operations. The system was migrated to Venmo for manual payment tracking to avoid transaction fees.

## Why Stripe Was Removed

- High transaction fees (2.9% + $0.30) were cost-prohibitive
- HOA preferred using Venmo for payments
- Manual payment verification was acceptable for the scale of operations
- Simplified payment flow without payment processor integration

## Replacement: Venmo Integration

The new implementation:
- Uses Venmo for manual payment submission
- Requires users to submit Venmo transaction ID
- Admin verifies and approves payments manually
- No transaction fees
- Better suited for community payment tracking

## Files Removed

- `src/components/StripeCheckout.tsx`
- `src/components/StripeCheckout.web.tsx`
- `src/components/StripeCheckout.native.tsx`
- `src/context/StripeProvider.tsx`
- `src/context/StripeProvider.web.tsx`
- `src/context/StripeProvider.native.tsx`
- `STRIPE_QUICK_START.md`
- `STRIPE_SETUP_GUIDE.md`

## Dependencies Removed

- `@stripe/stripe-js`
- `@stripe/react-stripe-js`
- `@stripe/stripe-react-native`
- `stripe`

## Notes

The Stripe webhook endpoint (`/stripe-webhook`) in `convex/http.ts` has been removed. Any pending Stripe payments should be manually updated in the database if needed.

