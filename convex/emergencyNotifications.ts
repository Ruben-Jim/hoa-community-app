import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("emergencyNotifications")
      .order("desc")
      .collect();
    return notifications;
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("emergencyNotifications")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
    return notifications;
  },
});

export const getByCategory = query({
  args: { category: v.union(
    v.literal("Security"),
    v.literal("Maintenance"),
    v.literal("Event"),
    v.literal("Lost Pet"),
    v.literal("Other")
  ) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("emergencyNotifications")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
    return notifications;
  },
});

export const getByPriority = query({
  args: { priority: v.union(
    v.literal("High"),
    v.literal("Medium"),
    v.literal("Low")
  ) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("emergencyNotifications")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .order("desc")
      .collect();
    return notifications;
  },
});

export const getById = query({
  args: { id: v.id("emergencyNotifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    return notification;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("Emergency"),
      v.literal("Alert"),
      v.literal("Info")
    ),
    priority: v.union(
      v.literal("High"),
      v.literal("Medium"),
      v.literal("Low")
    ),
    isActive: v.boolean(),
    category: v.union(
      v.literal("Security"),
      v.literal("Maintenance"),
      v.literal("Event"),
      v.literal("Lost Pet"),
      v.literal("Other")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const notificationId = await ctx.db.insert("emergencyNotifications", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return notificationId;
  },
});

export const update = mutation({
  args: {
    id: v.id("emergencyNotifications"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("Emergency"),
      v.literal("Alert"),
      v.literal("Info")
    )),
    priority: v.optional(v.union(
      v.literal("High"),
      v.literal("Medium"),
      v.literal("Low")
    )),
    isActive: v.optional(v.boolean()),
    category: v.optional(v.union(
      v.literal("Security"),
      v.literal("Maintenance"),
      v.literal("Event"),
      v.literal("Lost Pet"),
      v.literal("Other")
    )),
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
  args: { id: v.id("emergencyNotifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deactivate = mutation({
  args: { id: v.id("emergencyNotifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
}); 