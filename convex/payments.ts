import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a payment intent record in the database
export const createPaymentIntent = mutation({
  args: {
    userId: v.string(),
    feeType: v.string(),
    amount: v.number(),
    paymentIntentId: v.string(),
    feeId: v.optional(v.id("fees")),
    fineId: v.optional(v.id("fines")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const paymentId = await ctx.db.insert("payments", {
      userId: args.userId,
      feeType: args.feeType,
      amount: args.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      paymentMethod: "Stripe",
      transactionId: args.paymentIntentId,
      paymentIntentId: args.paymentIntentId,
      feeId: args.feeId,
      fineId: args.fineId,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

// Update payment status after webhook confirmation
export const updatePaymentStatus = mutation({
  args: {
    paymentIntentId: v.string(),
    status: v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue")),
  },
  handler: async (ctx, args) => {
    // Find the payment by transaction ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.paymentIntentId))
      .first();

    if (!payment) {
      throw new Error(`Payment with ID ${args.paymentIntentId} not found`);
    }

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // If payment is successful, update the associated fee or fine
    if (args.status === "Paid") {
      if (payment.feeId) {
        await ctx.db.patch(payment.feeId, {
          status: "Paid",
          updatedAt: Date.now(),
        });
      }
      
      if (payment.fineId) {
        await ctx.db.patch(payment.fineId, {
          status: "Paid",
          updatedAt: Date.now(),
        });
      }
    }

    return payment._id;
  },
});

// Get user payment history
export const getUserPayments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get all payments (admin only)
export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("payments")
      .order("desc")
      .collect();
  },
});

// Get payment by transaction ID
export const getPaymentByTransactionId = query({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.transactionId))
      .first();
  },
});

// Create a PayPal order record in the database
export const createPayPalOrder = mutation({
  args: {
    userId: v.string(),
    feeType: v.string(),
    amount: v.number(),
    orderId: v.string(),
    feeId: v.optional(v.id("fees")),
    fineId: v.optional(v.id("fines")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const paymentId = await ctx.db.insert("payments", {
      userId: args.userId,
      feeType: args.feeType,
      amount: args.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      paymentMethod: "PayPal",
      transactionId: args.orderId,
      paymentIntentId: args.orderId, // Using orderId as paymentIntentId for consistency
      feeId: args.feeId,
      fineId: args.fineId,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

// Update PayPal order status after payment completion
export const updatePayPalOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.union(v.literal("COMPLETED"), v.literal("PENDING"), v.literal("CANCELLED")),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the payment by transaction ID (orderId)
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.orderId))
      .first();

    if (!payment) {
      throw new Error(`PayPal order with ID ${args.orderId} not found`);
    }

    // Map PayPal status to our payment status
    let paymentStatus: "Paid" | "Pending" | "Overdue";
    if (args.status === "COMPLETED") {
      paymentStatus = "Paid";
    } else if (args.status === "PENDING") {
      paymentStatus = "Pending";
    } else {
      paymentStatus = "Overdue";
    }

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: paymentStatus,
      updatedAt: Date.now(),
    });

    // If payment is successful, update the associated fee or fine
    if (paymentStatus === "Paid") {
      if (payment.feeId) {
        await ctx.db.patch(payment.feeId, {
          status: "Paid",
          updatedAt: Date.now(),
        });
      }
      
      if (payment.fineId) {
        await ctx.db.patch(payment.fineId, {
          status: "Paid",
          updatedAt: Date.now(),
        });
      }
    }

    return payment._id;
  },
});

