import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active resident notifications
export const getAllActive = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("residentNotifications")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
    
    // Join with resident data to get full information
    const notificationsWithResidentInfo = await Promise.all(
      notifications.map(async (notification) => {
        const resident = await ctx.db.get(notification.residentId);
        return {
          ...notification,
          residentName: resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown',
          residentAddress: resident 
            ? `${resident.address}${resident.unitNumber ? ` #${resident.unitNumber}` : ''}` 
            : '',
          profileImage: resident?.profileImage || null,
        };
      })
    );
    
    return notificationsWithResidentInfo;
  },
});

// Create a new resident notification
export const create = mutation({
  args: {
    residentId: v.id("residents"),
    type: v.union(v.literal("Selling"), v.literal("Moving")),
    listingDate: v.optional(v.string()),
    closingDate: v.optional(v.string()),
    realtorInfo: v.optional(v.string()),
    newResidentName: v.optional(v.string()),
    isRental: v.optional(v.boolean()),
    additionalInfo: v.optional(v.string()),
    houseImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const notificationId = await ctx.db.insert("residentNotifications", {
      residentId: args.residentId,
      type: args.type,
      listingDate: args.listingDate,
      closingDate: args.closingDate,
      realtorInfo: args.realtorInfo,
      newResidentName: args.newResidentName,
      isRental: args.isRental,
      additionalInfo: args.additionalInfo,
      houseImage: args.houseImage,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return notificationId;
  },
});

// Update a resident notification
export const update = mutation({
  args: {
    id: v.id("residentNotifications"),
    listingDate: v.optional(v.string()),
    closingDate: v.optional(v.string()),
    realtorInfo: v.optional(v.string()),
    newResidentName: v.optional(v.string()),
    isRental: v.optional(v.boolean()),
    additionalInfo: v.optional(v.string()),
    houseImage: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Delete/Deactivate a resident notification
export const remove = mutation({
  args: {
    id: v.id("residentNotifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

