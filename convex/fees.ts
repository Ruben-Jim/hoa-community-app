import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fees").order("desc").collect();
  },
});

// Get fees for a specific resident
export const getByResident = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fees")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .order("desc")
      .collect();
  },
});

// Get unpaid fees for a specific resident
export const getUnpaidByResident = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fees")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .filter((q) => q.eq(q.field("isPaid"), false))
      .order("desc")
      .collect();
  },
});

// Get overdue fees for a specific resident
export const getOverdueByResident = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    const now = new Date();
    return await ctx.db
      .query("fees")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isPaid"), false),
          q.lt(q.field("dueDate"), now.toISOString().split('T')[0])
        )
      )
      .order("desc")
      .collect();
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
    residentId: v.optional(v.id("residents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("fees", { 
      ...args, 
      isPaid: false,
      createdAt: now, 
      updatedAt: now 
    });
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
    isPaid: v.optional(v.boolean()),
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// Mark fee as paid
export const markAsPaid = mutation({
  args: {
    id: v.id("fees"),
    paymentMethod: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      isPaid: true,
      paidAt: now,
      paymentMethod: args.paymentMethod,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("fees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Remove all yearly fees for a specific year
export const removeYearlyFees = mutation({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const yearlyFees = await ctx.db
      .query("fees")
      .filter((q) => 
        q.and(
          q.eq(q.field("frequency"), "Annually"),
          q.eq(q.field("name"), `Annual HOA Fee ${args.year}`)
        )
      )
      .collect();

    const deletedCount = yearlyFees.length;
    
    // Delete all yearly fees for the specified year
    for (const fee of yearlyFees) {
      await ctx.db.delete(fee._id);
    }

    return {
      success: true,
      deletedCount,
      year: args.year,
    };
  },
});

// Remove all yearly fees (use with caution)
export const removeAllYearlyFees = mutation({
  args: {},
  handler: async (ctx) => {
    const yearlyFees = await ctx.db
      .query("fees")
      .filter((q) => q.eq(q.field("frequency"), "Annually"))
      .collect();

    const deletedCount = yearlyFees.length;
    
    // Delete all yearly fees
    for (const fee of yearlyFees) {
      await ctx.db.delete(fee._id);
    }

    return {
      success: true,
      deletedCount,
    };
  },
});

// Create yearly HOA fee for all residents
export const createYearlyHOAFee = mutation({
  args: { 
    year: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dueDate = `${args.year}-12-31`; // Due at end of year
    
    // Get all active residents
    const residents = await ctx.db
      .query("residents")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const feeIds = [];
    
    // Create yearly HOA fee for each resident
    for (const resident of residents) {
      const feeId = await ctx.db.insert("fees", {
        name: `Annual HOA Fee ${args.year}`,
        amount: args.amount,
        frequency: "Annually",
        dueDate,
        description: `Annual HOA assessment for ${args.year} - covers maintenance, services, and community improvements`,
        isLate: false,
        residentId: resident._id,
        isPaid: false,
        createdAt: now,
        updatedAt: now,
      });
      feeIds.push(feeId);
    }

    return {
      success: true,
      feeIds,
      residentCount: residents.length,
      totalAmount: args.amount * residents.length,
    };
  },
});

// Create yearly HOA fee for current year (2024)
export const createCurrentYearHOAFee = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      console.log('🚀 Starting createCurrentYearHOAFee mutation...');
      const currentYear = new Date().getFullYear();
      const now = Date.now();
      const dueDate = `${currentYear}-12-31`; // Due at end of year
      
      console.log(`📅 Creating fees for year: ${currentYear}, due date: ${dueDate}`);
      
      // First, let's test if we can query residents at all
      console.log('🔍 Testing residents query...');
      const allResidents = await ctx.db.query("residents").collect();
      console.log(`📊 Found ${allResidents.length} total residents`);
      
      if (allResidents.length === 0) {
        console.log('⚠️ No residents found in database');
        return {
          success: false,
          error: 'No residents found in database',
          feeIds: [],
          residentCount: 0,
          totalAmount: 0,
        };
      }
      
      // Now try to get active residents
      console.log('🔍 Testing active residents query...');
      const residents = await ctx.db
        .query("residents")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      console.log(`👥 Found ${residents.length} active residents`);

      if (residents.length === 0) {
        console.log('⚠️ No active residents found');
        return {
          success: false,
          error: 'No active residents found. Please ensure residents have isActive: true',
          feeIds: [],
          residentCount: 0,
          totalAmount: 0,
        };
      }

      const feeIds = [];
      
      // Create yearly HOA fee for each resident
      for (const resident of residents) {
        console.log(`📝 Creating fee for resident: ${resident.firstName} ${resident.lastName} (${resident._id})`);
        
        try {
          const feeId = await ctx.db.insert("fees", {
            name: `Annual HOA Fee ${currentYear}`,
            amount: 300,
            frequency: "Annually",
            dueDate,
            description: `Annual HOA assessment for ${currentYear} - covers maintenance, services, and community improvements`,
            isLate: false,
            residentId: resident._id,
            isPaid: false,
            createdAt: now,
            updatedAt: now,
          });
          
          console.log(`✅ Created fee with ID: ${feeId}`);
          feeIds.push(feeId);
        } catch (insertError) {
          console.error(`❌ Error creating fee for resident ${resident._id}:`, insertError);
          throw insertError;
        }
      }

      const result = {
        success: true,
        feeIds,
        residentCount: residents.length,
        totalAmount: 300 * residents.length,
      };

      console.log('🎉 Fee generation completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in createCurrentYearHOAFee:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      throw error;
    }
  },
});

// Get yearly fees for a specific year
export const getYearlyFees = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const yearString = args.year.toString();
    return await ctx.db
      .query("fees")
      .filter((q) => 
        q.and(
          q.eq(q.field("frequency"), "Annually"),
          q.eq(q.field("name"), `Annual HOA Fee ${args.year}`)
        )
      )
      .collect();
  },
});

// Get all yearly fees
export const getAllYearlyFees = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fees")
      .filter((q) => q.eq(q.field("frequency"), "Annually"))
      .order("desc")
      .collect();
  },
});







