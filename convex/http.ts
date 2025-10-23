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

export default http;

