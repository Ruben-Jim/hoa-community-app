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
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Paid"),
        v.literal("Overdue")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fee = await ctx.db.get(id);
    
    if (!fee) {
      throw new Error(`Fee with ID ${id} not found`);
    }
    
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
      paymentMethod: 'Venmo', // Default to Venmo for legacy payments
      transactionId: `legacy-${now}`, // Legacy payment without Venmo transaction
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
    // If there are any unpaid fines, the user is not fully paid
    const unpaidFines = await ctx.db
      .query("fines")
      .filter((q) =>
        q.and(
          q.eq(q.field("residentId"), args.userId),
          q.neq(q.field("status"), "Paid")
        )
      )
      .collect();
    if (unpaidFines.length > 0) return false;

    // Prefer explicit fee records when present
    const userAnnualFees = await ctx.db
      .query("fees")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("frequency"), "Annually"),
          q.eq(q.field("year"), currentYear)
        )
      )
      .collect();

    if (userAnnualFees.length > 0) {
      // User is fully paid only if all annual fees for the year are Paid
      const allAnnualFeesPaid = userAnnualFees.every((fee) => fee.status === "Paid");
      return allAnnualFeesPaid;
    }

    // Fallback to payment records
    // Check if user has any verified paid payments for this year that cover their fees
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const verifiedPaidPayments = payments.filter((payment) => {
      // Payment must have status "Paid" AND verificationStatus "Verified"
      const isPaid = payment.status === "Paid";
      const isVerified = payment.verificationStatus === "Verified";
      return isPaid && isVerified;
    });

    // Check if all fees for the user are covered by verified payments
    const userFees = await ctx.db
      .query("fees")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // If user has fees, check if all are paid via verified payments
    if (userFees.length > 0) {
      const allFeesCovered = userFees.every((fee) => 
        verifiedPaidPayments.some((payment) => 
          payment.feeId === fee._id && payment.status === "Paid" && payment.verificationStatus === "Verified"
        )
      );
      return allFeesCovered;
    }

    // If no fees exist, check if there's any verified payment for the current year
    const hasAnyVerifiedPayment = verifiedPaidPayments.some((payment) => {
      const paymentYear = new Date(payment.paymentDate).getFullYear();
      return paymentYear === currentYear;
    });

    return hasAnyVerifiedPayment;
  },
});

// Get all homeowners' payment status for admin view (excludes renters)
export const getAllHomeownersPaymentStatus = query({
  args: {},
  handler: async (ctx) => {
    // First check if there are any fees in the system
    const allFees = await ctx.db.query("fees").collect();
    
    // If no fees exist, return empty array
    if (allFees.length === 0) {
      return [];
    }
    
    const residents = await ctx.db.query("residents").collect();
    const currentYear = new Date().getFullYear();
    
    // Filter to only include homeowners (isResident = true and not renters)
    const homeowners = residents.filter(resident => resident.isResident && !resident.isRenter);
    
    const homeownersWithPaymentStatus = await Promise.all(
      homeowners.map(async (homeowner) => {
        // Determine paid status based on unpaid items (fees + fines)
        const unpaidFines = await ctx.db
          .query("fines")
          .filter((q) =>
            q.and(
              q.eq(q.field("residentId"), homeowner._id),
              q.neq(q.field("status"), "Paid")
            )
          )
          .collect();

        const userAnnualFees = allFees.filter(
          (fee) =>
            fee.userId === homeowner._id &&
            fee.year === currentYear &&
            fee.frequency === "Annually"
        );

        // If there are explicit annual fee records, require all to be Paid
        let hasPaid = false;
        if (userAnnualFees.length > 0) {
          const allAnnualFeesPaid = userAnnualFees.every((fee) => fee.status === "Paid");
          hasPaid = allAnnualFeesPaid && unpaidFines.length === 0;
        } else {
          // Fallback to payment records
          // Only count payments that are verified AND paid
          const payments = await ctx.db
            .query("payments")
            .withIndex("by_user", (q) => q.eq("userId", homeowner._id))
            .collect();
          const verifiedPaidPayments = payments.filter((payment) => {
            // Payment must have status "Paid" AND verificationStatus "Verified"
            // Do NOT count rejected or pending payments
            const isPaid = payment.status === "Paid";
            const isVerified = payment.verificationStatus === "Verified";
            // Exclude payments that are rejected
            const isNotRejected = payment.verificationStatus !== "Rejected";
            return isPaid && isVerified && isNotRejected;
          });
          const hasPaidViaPaymentRecord = verifiedPaidPayments.some((payment) => {
            const paymentYear = new Date(payment.paymentDate).getFullYear();
            const isAnnualFee = typeof payment.feeType === "string" && payment.feeType.startsWith("Annual HOA Fee");
            return paymentYear === currentYear && isAnnualFee;
          });
          hasPaid = hasPaidViaPaymentRecord && unpaidFines.length === 0;
        }
        
        // Find the annual fee for this homeowner
        const homeownerFee = allFees.find(fee => 
          fee.userId === homeowner._id && 
          fee.year === currentYear &&
          fee.frequency === "Annually"
        );
        
        // Determine user type
        let userType = 'homeowner';
        if (homeowner.isBoardMember) userType = 'board-member';
        
        return {
          ...homeowner,
          userType,
          hasPaidAnnualFee: hasPaid,
          paymentStatus: hasPaid ? 'Paid' : 'Pending',
          annualFeeAmount: homeownerFee?.amount || 300, // Use actual fee amount or default to 300
        };
      })
    );
    
    return homeownersWithPaymentStatus;
  },
});

// Create annual fees for all homeowners for a specific year
export const createYearFeesForAllHomeowners = mutation({
  args: {
    year: v.number(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const residents = await ctx.db.query("residents").collect();
    
    // Filter to only include homeowners (isResident = true and not renters)
    const homeowners = residents.filter(resident => resident.isResident && !resident.isRenter);
    
    const now = Date.now();
    const feeRecords = [];
    
    // Create fee records for each homeowner
    for (const homeowner of homeowners) {
      const feeRecord = await ctx.db.insert("fees", {
        name: `${args.description} ${args.year}`,
        amount: args.amount,
        frequency: "Annually",
        dueDate: `${args.year}-12-31`,
        description: args.description,
        isLate: false, // Initially not late
        userId: homeowner._id, // Link to specific homeowner
        year: args.year,
        createdAt: now,
        updatedAt: now,
      });
      
      feeRecords.push(feeRecord);
    }
    
    return {
      success: true,
      feesCreated: feeRecords.length,
      message: `Created ${feeRecords.length} annual fees for year ${args.year}`,
    };
  },
});

// Update all annual fees for a specific year
export const updateAllAnnualFees = mutation({
  args: {
    year: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const allFees = await ctx.db.query("fees").collect();
    
    // Filter to get all annual fees for the specified year that are not paid
    const annualFeesToUpdate = allFees.filter(
      (fee) =>
        fee.frequency === "Annually" &&
        fee.year === args.year &&
        fee.status !== "Paid"
    );
    
    const now = Date.now();
    let updatedCount = 0;
    
    // Update each fee
    for (const fee of annualFeesToUpdate) {
      await ctx.db.patch(fee._id, {
        amount: args.amount,
        updatedAt: now,
      });
      updatedCount++;
    }
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `Updated ${updatedCount} annual fee${updatedCount !== 1 ? 's' : ''} for year ${args.year} to $${args.amount.toFixed(2)}`,
    };
  },
});

// Add a fine to a specific property address
export const addFineToProperty = mutation({
  args: {
    address: v.string(),
    homeownerId: v.string(),
    amount: v.number(),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the fine record in the fines table
    const fineRecord = await ctx.db.insert("fines", {
      violation: args.reason,
      amount: args.amount,
      dateIssued: new Date().toISOString().split('T')[0],
      status: "Pending",
      description: args.description || `Fine for ${args.reason}`,
      residentId: args.homeownerId,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      success: true,
      fineId: fineRecord,
      message: `Fine of $${args.amount} added to ${args.address}`,
    };
  },
});

// Get all fines for admin view
export const getAllFines = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fines")
      .order("desc")
      .collect();
  },
});

// Get fines for a specific homeowner
export const getFinesForHomeowner = query({
  args: { homeownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fines")
      .filter((q) => q.eq(q.field("residentId"), args.homeownerId))
      .order("desc")
      .collect();
  },
});

// Update fine status (mark as paid, etc.)
export const updateFineStatus = mutation({
  args: {
    fineId: v.id("fines"),
    status: v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue")),
  },
  handler: async (ctx, args) => {
    const fine = await ctx.db.get(args.fineId);
    
    if (!fine) {
      throw new Error(`Fine with ID ${args.fineId} not found`);
    }
    
    await ctx.db.patch(args.fineId, { 
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      message: `Fine status updated to ${args.status}`,
    };
  },
});

// Add past due amount to a resident
export const addPastDueAmount = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.string(),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dueDateObj = new Date(args.dueDate);
    const isLate = dueDateObj < new Date();
    
    const feeRecord = await ctx.db.insert("fees", {
      name: `Past Due: ${args.description}`,
      amount: args.amount,
      frequency: "One-time",
      dueDate: args.dueDate,
      description: args.description,
      isLate: isLate,
      userId: args.userId,
      status: "Overdue",
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      success: true,
      feeId: feeRecord,
      message: `Past due amount of $${args.amount} added successfully`,
    };
  },
});






