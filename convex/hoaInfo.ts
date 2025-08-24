import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const info = await ctx.db.query("hoaInfo").first();
    return info ?? null;
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    officeHours: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("hoaInfo").first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    const id = await ctx.db.insert("hoaInfo", { ...args, createdAt: now, updatedAt: now });
    return id;
  },
});


