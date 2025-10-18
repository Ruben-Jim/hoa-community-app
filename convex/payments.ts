import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all payments for a specific resident
export const getByResident = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .order("desc")
      .collect();
  },
});

// Get payments by status
export const getByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"), v.literal("canceled")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Get payments for a specific fee
export const getByFee = query({
  args: { feeId: v.id("fees") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_fee", (q) => q.eq("feeId", args.feeId))
      .order("desc")
      .collect();
  },
});

// Get payments for a specific fine
export const getByFine = query({
  args: { fineId: v.id("fines") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_fine", (q) => q.eq("fineId", args.fineId))
      .order("desc")
      .collect();
  },
});

// Create a new payment record
export const create = mutation({
  args: {
    residentId: v.id("residents"),
    feeId: v.optional(v.id("fees")),
    fineId: v.optional(v.id("fines")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"), v.literal("canceled")),
    paymentMethod: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("payments", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update payment status
export const updateStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"), v.literal("canceled")),
    stripeChargeId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Get payment by Stripe payment intent ID
export const getByStripePaymentIntent = query({
  args: { stripePaymentIntentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.stripePaymentIntentId))
      .first();
  },
});

// Get payment statistics for a resident
export const getStatsByResident = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .collect();

    const totalPaid = payments
      .filter(p => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalFailed = payments
      .filter(p => p.status === "failed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPaid,
      totalPending,
      totalFailed,
      totalTransactions: payments.length,
      successfulTransactions: payments.filter(p => p.status === "succeeded").length,
    };
  },
});
