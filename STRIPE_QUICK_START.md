# Stripe Quick Start (5 Minutes)

Get Stripe payments working in your app in 5 minutes.

## 1. Get Stripe Test Keys (2 minutes)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (pk_test_...)
3. Copy your **Secret key** (sk_test_...) - click "Reveal test key"

## 2. Configure Environment (1 minute)

### Client-Side (.env.local)

Create or edit `.env.local` in your project root:

```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### Server-Side (Convex Dashboard)

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add:
   - `STRIPE_KEY` = `sk_test_YOUR_SECRET_KEY_HERE`
   - `STRIPE_WEBHOOKS_SECRET` = (leave empty for now)

## 3. Deploy Convex (1 minute)

```bash
npx convex dev
```

Wait for deployment to complete. Keep this running.

## 4. Test Payment (1 minute)

1. Start your app: `npm start`
2. Navigate to **Fees & Fines** screen
3. Click **Pay Now** on any fee/fine
4. Fill in payment form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., 12/34)
   - **CVC**: Any 3 digits (e.g., 123)
5. Click **Pay $XXX.XX**

✅ Payment should succeed!

## Verify Payment

1. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments
2. Check Convex Dashboard: https://dashboard.convex.dev → Data → payments table

## What's Next?

### Set Up Webhooks (Optional but Recommended)

Webhooks update payment status automatically when Stripe processes payments.

**Quick Method (Local Development):**

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (macOS)
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to https://YOUR-PROJECT.convex.site/stripe-webhook
   ```
4. Copy the webhook secret (whsec_...)
5. Add to Convex Dashboard as `STRIPE_WEBHOOKS_SECRET`

See `STRIPE_SETUP_GUIDE.md` for production webhook setup.

## Common Issues

### "Payment processing not configured"
- Make sure `STRIPE_KEY` is set in Convex Dashboard
- Redeploy: `npx convex dev`

### Card element not showing
- Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is in `.env.local`
- Restart your app

### Payment fails
- Use test card: `4242 4242 4242 4242`
- Check amount is at least $0.50
- Check browser/app console for errors

## Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | 🔐 Requires auth |

## Going Live

When ready for production:

1. Get live keys from Stripe (pk_live_... and sk_live_...)
2. Update environment variables
3. Set up production webhooks
4. Deploy: `npx convex deploy`

See `STRIPE_SETUP_GUIDE.md` for complete production setup.

## Architecture

### Payment Flow
```
User clicks "Pay Now"
  ↓
PaymentModal opens
  ↓
Create payment intent (Convex HTTP)
  ↓
Stripe Elements/CardField collects card
  ↓
Confirm payment with Stripe
  ↓
Webhook updates status
  ↓
Success! Payment complete
```

### Files Created
- ✅ `convex/schema.ts` - Updated payments table
- ✅ `convex/http.ts` - Stripe endpoints
- ✅ `convex/payments.ts` - Payment mutations
- ✅ `src/context/StripeProvider.tsx` - Stripe wrapper
- ✅ `src/components/PaymentModal.tsx` - Payment UI
- ✅ `src/components/StripeCheckoutWeb.tsx` - Web form
- ✅ `src/components/StripeCheckoutMobile.tsx` - Mobile form
- ✅ `App.tsx` - Wrapped with StripeProvider
- ✅ `src/screens/FeesScreen.tsx` - Integrated payments

## Support

- Full documentation: `STRIPE_SETUP_GUIDE.md`
- Stripe docs: https://stripe.com/docs
- Convex docs: https://docs.convex.dev

---

**🎉 You're ready to accept payments!**

