import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fees").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    frequency: v.union(
      v.literal("Monthly"),
      v.literal("Quarterly"),
      v.literal("Annually"),
      v.literal("One-time")
    ),
    dueDate: v.string(),
    description: v.string(),
    isLate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("fees", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: {
    id: v.id("fees"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    frequency: v.optional(
      v.union(
        v.literal("Monthly"),
        v.literal("Quarterly"),
        v.literal("Annually"),
        v.literal("One-time")
      )
    ),
    dueDate: v.optional(v.string()),
    description: v.optional(v.string()),
    isLate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("fees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get user-specific fees based on their status
export const getUserFees = query({
  args: { 
    userId: v.string(),
    userType: v.string(), // 'resident', 'renter', 'board-member'
    hasPaid: v.boolean()
  },
  handler: async (ctx, args) => {
    // Generate dynamic fees based on user status
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    
    // Base fee structure for residents/homeowners
    let userFees = [];
    
    // Only homeowners (isResident = true and not renters) get annual fees
    if (args.userType === 'homeowner' || args.userType === 'board-member') {
      // Annual HOA Fee - $300 for homeowners
      userFees.push({
        _id: `annual-fee-${args.userId}`,
        name: 'Annual HOA Fee',
        amount: 300,
        frequency: 'Annually',
        dueDate: `${currentYear}-12-31`,
        description: 'Annual HOA assessment for community maintenance and services',
        isLate: !args.hasPaid && new Date() > new Date(`${currentYear}-12-31`),
        status: args.hasPaid ? 'Paid' : 'Pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return userFees;
  },
});

// Create a fee payment record
export const recordPayment = mutation({
  args: {
    userId: v.string(),
    feeType: v.string(),
    amount: v.number(),
    paymentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("payments", {
      userId: args.userId,
      feeType: args.feeType,
      amount: args.amount,
      paymentDate: args.paymentDate,
      status: 'Paid',
      createdAt: now,
      updatedAt: now,
    });
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

// Check if user has paid annual fee for current year
export const hasPaidAnnualFee = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("feeType"), "Annual HOA Fee"),
          q.eq(q.field("status"), "Paid")
        )
      )
      .collect();
    
    // Check if any payment was made in the current year
    return payments.some(payment => {
      const paymentYear = new Date(payment.paymentDate).getFullYear();
      return paymentYear === currentYear;
    });
  },
});

// Get all homeowners' payment status for admin view (excludes renters)
export const getAllHomeownersPaymentStatus = query({
  args: {},
  handler: async (ctx) => {
    const residents = await ctx.db.query("residents").collect();
    const currentYear = new Date().getFullYear();
    
    // Filter to only include homeowners (isResident = true and not renters)
    const homeowners = residents.filter(resident => resident.isResident && !resident.isRenter);
    
    const homeownersWithPaymentStatus = await Promise.all(
      homeowners.map(async (homeowner) => {
        // Check if homeowner has paid annual fee
        const payments = await ctx.db
          .query("payments")
          .withIndex("by_user", (q) => q.eq("userId", homeowner._id))
          .filter((q) => 
            q.and(
              q.eq(q.field("feeType"), "Annual HOA Fee"),
              q.eq(q.field("status"), "Paid")
            )
          )
          .collect();
        
        const hasPaid = payments.some(payment => {
          const paymentYear = new Date(payment.paymentDate).getFullYear();
          return paymentYear === currentYear;
        });
        
        // Determine user type
        let userType = 'homeowner';
        if (homeowner.isBoardMember) userType = 'board-member';
        
        return {
          ...homeowner,
          userType,
          hasPaidAnnualFee: hasPaid,
          paymentStatus: hasPaid ? 'Paid' : 'Pending',
          annualFeeAmount: 300, // $300 for all homeowners
        };
      })
    );
    
    return homeownersWithPaymentStatus;
  },
});






