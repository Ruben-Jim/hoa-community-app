import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a Venmo payment record in the database
export const createVenmoPayment = mutation({
  args: {
    userId: v.string(),
    feeType: v.string(),
    amount: v.number(),
    venmoUsername: v.string(),
    venmoTransactionId: v.string(),
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
      paymentMethod: "Venmo",
      transactionId: args.venmoTransactionId,
      venmoUsername: args.venmoUsername,
      venmoTransactionId: args.venmoTransactionId,
      verificationStatus: "Pending",
      feeId: args.feeId,
      fineId: args.fineId,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

// Verify Venmo payment (admin only)
export const verifyVenmoPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue")),
    verificationStatus: v.union(v.literal("Verified"), v.literal("Rejected")),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);

    if (!payment) {
      throw new Error(`Payment not found`);
    }

    // Update payment status and verification status
    await ctx.db.patch(payment._id, {
      status: args.status,
      verificationStatus: args.verificationStatus,
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

// Get pending Venmo payments (admin only) - payments awaiting verification
export const getPendingVenmoPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("payments")
      .filter((q) => 
        q.and(
          q.eq(q.field("paymentMethod"), "Venmo"),
          q.or(
            q.eq(q.field("verificationStatus"), "Pending"),
            q.eq(q.field("verificationStatus"), undefined)
          )
        )
      )
      .order("desc")
      .collect();
  },
});


