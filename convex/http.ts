import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS /stripe - Handle CORS preflight
http.route({
  path: "/stripe",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// OPTIONS /paypal - Handle CORS preflight
http.route({
  path: "/paypal",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// OPTIONS /paypal-status - Handle CORS preflight
http.route({
  path: "/paypal-status",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// POST /stripe - Create payment intent
http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { amount, currency = "usd", userId, feeType, feeId, fineId } = body;

      // Validate required fields
      if (!amount || !userId || !feeType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, userId, feeType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      }

      // Validate amount (amount is in dollars, will be converted to cents below)
      if (amount < 0.50) { // Stripe minimum is $0.50
        return new Response(
          JSON.stringify({ error: "Amount must be at least $0.50" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Initialize Stripe with API key from environment
      const stripeKey = process.env.STRIPE_KEY;
      if (!stripeKey) {
        console.error("STRIPE_KEY environment variable not set");
        return new Response(
          JSON.stringify({ error: "Payment processing not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: "2025-09-30.clover",
      });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId,
          feeType,
          feeId: feeId || "",
          fineId: fineId || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment intent in database
      await ctx.runMutation(api.payments.createPaymentIntent, {
        userId,
        feeType,
        amount,
        paymentIntentId: paymentIntent.id,
        feeId,
        fineId,
      });

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to create payment intent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// POST /stripe-webhook - Handle Stripe webhook events
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        return new Response("No signature", { status: 400 });
      }

      const stripeKey = process.env.STRIPE_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET;

      if (!stripeKey || !webhookSecret) {
        console.error("Stripe environment variables not configured");
        return new Response("Webhook not configured", { status: 500 });
      }

      const stripe = new Stripe(stripeKey, {
        apiVersion: "2025-09-30.clover",
      });

      // Get raw body
      const body = await request.text();

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log("Payment succeeded:", paymentIntent.id);

          // Update payment status in database
          await ctx.runMutation(api.payments.updatePaymentStatus, {
            paymentIntentId: paymentIntent.id,
            status: "Paid",
          });
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log("Payment failed:", paymentIntent.id);

          // Update payment status in database
          await ctx.runMutation(api.payments.updatePaymentStatus, {
            paymentIntentId: paymentIntent.id,
            status: "Overdue",
          });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// POST /paypal - Create PayPal order
http.route({
  path: "/paypal",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { amount, currency = "USD", userId, feeType, feeId, fineId } = body;

      // Validate required fields
      if (!amount || !userId || !feeType) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: amount, userId, feeType" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate amount (PayPal minimum is $0.01)
      if (amount < 0.01) {
        return new Response(
          JSON.stringify({ error: "Amount must be at least $0.01" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get PayPal credentials from environment
      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalMode = process.env.PAYPAL_MODE || "sandbox"; // sandbox or live

      if (!paypalClientId || !paypalClientSecret) {
        console.error("PayPal environment variables not set");
        return new Response(
          JSON.stringify({ error: "PayPal payment processing not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // PayPal API endpoints
      const baseUrl = paypalMode === "live" 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";

      // Get access token
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get PayPal access token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Create PayPal order
      const orderData = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: feeType,
            custom_id: `${userId}-${feeId || fineId || 'payment'}`,
          },
        ],
        application_context: {
          return_url: `${process.env.EXPO_PUBLIC_CONVEX_SITE_URL}/paypal-return`,
          cancel_url: `${process.env.EXPO_PUBLIC_CONVEX_SITE_URL}/paypal-cancel`,
        },
      };

      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`PayPal order creation failed: ${errorData.message || 'Unknown error'}`);
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.id;

      // Store PayPal order in database
      await ctx.runMutation(api.payments.createPayPalOrder, {
        userId,
        feeType,
        amount,
        orderId,
        feeId,
        fineId,
      });

      // Find approval URL
      const approvalUrl = orderResult.links?.find((link: any) => link.rel === "approve")?.href;

      if (!approvalUrl) {
        throw new Error("No PayPal approval URL received");
      }

      return new Response(
        JSON.stringify({
          orderId,
          approvalUrl,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to create PayPal order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// POST /paypal-status - Check PayPal order status
http.route({
  path: "/paypal-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { orderId } = body;

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Missing orderId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get PayPal credentials from environment
      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalMode = process.env.PAYPAL_MODE || "sandbox";

      if (!paypalClientId || !paypalClientSecret) {
        return new Response(
          JSON.stringify({ error: "PayPal not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const baseUrl = paypalMode === "live" 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";

      // Get access token
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get PayPal access token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get order details
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to get PayPal order status");
      }

      const orderData = await orderResponse.json();
      const status = orderData.status;

      // If order is approved, capture it
      if (status === "APPROVED") {
        const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (captureResponse.ok) {
          const captureData = await captureResponse.json();
          
          // Update payment status in database
          await ctx.runMutation(api.payments.updatePayPalOrderStatus, {
            orderId,
            status: "COMPLETED",
            transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          });

          return new Response(
            JSON.stringify({ status: "COMPLETED" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("Error checking PayPal order status:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to check order status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// TODO: Apple Pay Integration (Backend Routes)
// Uncomment and implement when ready to add Apple Pay support

/*
// OPTIONS /apple-pay - Handle CORS preflight
http.route({
  path: "/apple-pay",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// POST /apple-pay - Process Apple Pay payment
http.route({
  path: "/apple-pay",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { amount, currency = "USD", userId, feeType, feeId, fineId, paymentToken } = body;

      // Validate required fields
      if (!amount || !userId || !feeType || !paymentToken) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: amount, userId, feeType, paymentToken" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // TODO: Implement Apple Pay payment processing
      // 1. Validate payment token with Apple
      // 2. Process payment through payment processor (Stripe/PayPal)
      // 3. Store payment record in database
      // 4. Update fee/fine status

      return new Response(
        JSON.stringify({ success: true, transactionId: "apple_pay_txn_" + Date.now() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("Error processing Apple Pay payment:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to process Apple Pay payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});
*/

// TODO: Google Pay Integration (Backend Routes)
// Uncomment and implement when ready to add Google Pay support

/*
// OPTIONS /google-pay - Handle CORS preflight
http.route({
  path: "/google-pay",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// POST /google-pay - Process Google Pay payment
http.route({
  path: "/google-pay",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { amount, currency = "USD", userId, feeType, feeId, fineId, paymentData } = body;

      // Validate required fields
      if (!amount || !userId || !feeType || !paymentData) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: amount, userId, feeType, paymentData" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // TODO: Implement Google Pay payment processing
      // 1. Validate payment data with Google
      // 2. Process payment through payment processor (Stripe/PayPal)
      // 3. Store payment record in database
      // 4. Update fee/fine status

      return new Response(
        JSON.stringify({ success: true, transactionId: "google_pay_txn_" + Date.now() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("Error processing Google Pay payment:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to process Google Pay payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});
*/

export default http;

