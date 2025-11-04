import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteStorageFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Try to delete, but don't fail if the file doesn't exist
    try {
      await ctx.storage.delete(args.storageId);
    } catch (error) {
      // Ignore "not found" errors as the file may have already been deleted
      console.log(`File ${args.storageId} not found or already deleted`);
    }
  },
});
