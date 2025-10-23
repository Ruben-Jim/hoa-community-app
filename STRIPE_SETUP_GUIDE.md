# Stripe Payment Setup Guide

This guide will walk you through setting up Stripe payments for the HOA Community App.

## Prerequisites

- Stripe account (get one at https://stripe.com)
- Convex project configured
- Development environment set up

## Step 1: Get Your Stripe API Keys

### For Testing (Development)

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Navigate to **Developers** > **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### For Production

1. Switch to **Live Mode** in Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 2: Configure Client-Side Keys

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Stripe publishable key:
   ```
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

## Step 3: Configure Server-Side Keys (Convex Dashboard)

**IMPORTANT:** Server-side keys should NEVER be in your `.env.local` file!

1. Go to Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add the following variables:
   - Key: `STRIPE_KEY`
     Value: `sk_test_51...` (your Stripe secret key)
   - Key: `STRIPE_WEBHOOKS_SECRET`
     Value: (leave empty for now, we'll add this in Step 4)

## Step 4: Set Up Webhooks

Webhooks allow Stripe to notify your app when payments succeed or fail.

### For Local Development

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (with Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Get your Convex deployment URL:
   ```bash
   npx convex dev
   # Look for the URL, typically: https://your-project.convex.site
   ```

4. Forward webhooks to your local Convex endpoint:
   ```bash
   stripe listen --forward-to https://your-project.convex.site/stripe-webhook
   ```

5. Copy the webhook signing secret (starts with `whsec_`) that appears
6. Add it to Convex Dashboard as `STRIPE_WEBHOOKS_SECRET`

### For Production

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your production Convex URL:
   ```
   https://your-project.convex.site/stripe-webhook
   ```
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Click to reveal the **Signing secret** (starts with `whsec_`)
7. Update the `STRIPE_WEBHOOKS_SECRET` in Convex Dashboard with this value

## Step 5: Deploy Convex Functions

Deploy your Convex functions with the HTTP routes:

```bash
npx convex dev
```

Or for production:
```bash
npx convex deploy
```

## Step 6: Test the Integration

### Test Card Numbers

Stripe provides test card numbers for development:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Payment declined |
| 4000 0025 0000 3155 | Requires authentication |

- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Testing Flow

1. Start your app:
   ```bash
   npm start
   ```

2. Navigate to the Fees & Fines screen
3. Click "Pay Now" on a fee or fine
4. Fill in payment details:
   - Name: Test User
   - Email: test@example.com
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

5. Click "Pay"
6. Verify payment success
7. Check Stripe Dashboard > Payments to see the test payment
8. Check Convex Dashboard > Data to see the payment record

### Verifying Webhooks

1. Make a test payment
2. Check your Stripe CLI output (if running locally) for webhook events
3. Check Convex logs for webhook processing
4. Verify the payment status updated in your database

## Troubleshooting

### "Payment processing not configured" Error

- Verify `STRIPE_KEY` is set in Convex Dashboard
- Redeploy Convex functions: `npx convex deploy`

### Webhook Signature Verification Failed

- Verify `STRIPE_WEBHOOKS_SECRET` matches your webhook endpoint
- For local development, make sure Stripe CLI is running
- For production, verify the webhook secret from Stripe Dashboard

### Payment Intent Creation Fails

- Check that publishable key is in `.env.local`
- Verify amount is at least $0.50 (50 cents)
- Check browser console for errors

### Database Errors

- Ensure Convex schema is up to date
- Run `npx convex dev` to sync schema changes
- Check that payment mutations are deployed

## Security Best Practices

1. ✅ **Never expose secret keys**: Keep `STRIPE_KEY` only in Convex Dashboard
2. ✅ **Use HTTPS in production**: Convex handles this automatically
3. ✅ **Verify webhook signatures**: Our implementation does this
4. ✅ **PCI Compliance**: We use Stripe Elements/CardField (PCI compliant)
5. ✅ **Validate amounts**: We validate on both client and server
6. ✅ **Handle errors gracefully**: User-friendly error messages

## Going Live

When ready for production:

1. Switch Stripe to Live Mode
2. Update `.env.local` with live publishable key
3. Update Convex Dashboard with live secret key
4. Set up production webhook endpoint
5. Update `STRIPE_WEBHOOKS_SECRET` with production webhook secret
6. Deploy to production: `npx convex deploy`
7. Test with a real card (small amount)
8. Monitor Stripe Dashboard for live payments

## Support

- Stripe Documentation: https://stripe.com/docs
- Convex Documentation: https://docs.convex.dev
- Stripe Support: https://support.stripe.com

## Architecture Overview

### Payment Flow

1. **Frontend**: User clicks "Pay Now"
2. **PaymentModal** opens with embedded Stripe form
3. **Frontend** requests payment intent from Convex HTTP endpoint
4. **Convex HTTP** creates Stripe payment intent and stores in DB
5. **Frontend** receives client secret
6. **Stripe Elements/CardField** collects card securely
7. **Frontend** confirms payment with Stripe
8. **Stripe** processes payment and sends webhook
9. **Convex Webhook Handler** updates payment status
10. **Frontend** shows success and refreshes data

### Components

- **Backend**:
  - `convex/schema.ts` - Database schema
  - `convex/http.ts` - HTTP endpoints for Stripe
  - `convex/payments.ts` - Payment mutations/queries

- **Frontend**:
  - `src/context/StripeProvider.tsx` - Platform-aware Stripe wrapper
  - `src/components/PaymentModal.tsx` - Payment UI
  - `src/components/StripeCheckoutWeb.tsx` - Web payment form
  - `src/components/StripeCheckoutMobile.tsx` - Mobile payment form
  - `src/screens/FeesScreen.tsx` - Integrated payment button

## Future Enhancements

The payment system is architected to support:

- **PayPal** - Add PayPalCheckout component and Convex route
- **Apple Pay** - Use Stripe's Apple Pay integration via CardElement
- **Google Pay** - Use Stripe's Google Pay integration via CardElement
- **Recurring Payments** - Stripe Subscriptions API
- **Payment Plans** - Custom installment logic
- **Refunds** - Stripe Refunds API

Simply add new payment method components and update the `paymentMethod` field in the database schema.

