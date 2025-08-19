import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const boardMembers = await ctx.db
      .query("boardMembers")
      .order("desc")
      .collect();
    return boardMembers;
  },
});

export const getById = query({
  args: { id: v.id("boardMembers") },
  handler: async (ctx, args) => {
    const boardMember = await ctx.db.get(args.id);
    return boardMember;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    position: v.string(),
    email: v.string(),
    phone: v.string(),
    image: v.optional(v.string()),
    termEnd: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const boardMemberId = await ctx.db.insert("boardMembers", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return boardMemberId;
  },
});

export const update = mutation({
  args: {
    id: v.id("boardMembers"),
    name: v.optional(v.string()),
    position: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    termEnd: v.optional(v.string()),
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
  args: { id: v.id("boardMembers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 