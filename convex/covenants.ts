import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const covenants = await ctx.db
      .query("covenants")
      .order("desc")
      .collect();
    return covenants;
  },
});

export const getByCategory = query({
  args: { category: v.union(
    v.literal("Architecture"),
    v.literal("Landscaping"),
    v.literal("Minutes"),
    v.literal("Caveats"),
    v.literal("General")
  ) },
  handler: async (ctx, args) => {
    const covenants = await ctx.db
      .query("covenants")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    return covenants;
  },
});

export const getById = query({
  args: { id: v.id("covenants") },
  handler: async (ctx, args) => {
    const covenant = await ctx.db.get(args.id);
    return covenant;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Architecture"),
      v.literal("Landscaping"),
      v.literal("Minutes"),
      v.literal("Caveats"),
      v.literal("General")
    ),
    lastUpdated: v.string(),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const covenantId = await ctx.db.insert("covenants", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return covenantId;
  },
});

export const update = mutation({
  args: {
    id: v.id("covenants"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("Architecture"),
      v.literal("Landscaping"),
      v.literal("Minutes"),
      v.literal("Caveats"),
      v.literal("General")
    )),
    lastUpdated: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("covenants") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 