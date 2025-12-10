import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const boardMembers = await ctx.db
      .query("boardMembers")
      .collect();
    
    // Sort by sortOrder (lower numbers first), with undefined/null values last
    return boardMembers.sort((a, b) => {
      const aOrder = a.sortOrder ?? 999;
      const bOrder = b.sortOrder ?? 999;
      return aOrder - bOrder;
    });
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
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    termEnd: v.optional(v.string()),
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
    bio: v.optional(v.string()),
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
    // Get the board member record to find their email
    const boardMember = await ctx.db.get(args.id);
    
    if (boardMember && boardMember.email) {
      // Find the corresponding resident by email
      const resident = await ctx.db
        .query("residents")
        .withIndex("by_email", (q) => q.eq("email", boardMember.email))
        .first();
      
      // If resident exists, update their isBoardMember flag to false
      // This ensures they remain as a homeowner when stepping down from the board
      if (resident) {
        await ctx.db.patch(resident._id, {
          isBoardMember: false,
          updatedAt: Date.now(),
        });
      }
    }
    
    // Delete the board member record
    await ctx.db.delete(args.id);
  },
}); 

// Maintenance: backfill optional fields on existing documents
export const backfillOptionalFields = mutation({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("boardMembers").collect();
    let updated = 0;
    for (const m of members) {
      const needsPatch =
        (m.phone === undefined || m.phone === null) ||
        (m.bio === undefined || m.bio === null) ||
        (m.image === undefined || m.image === null) ||
        (m.termEnd === undefined || m.termEnd === null);
      if (needsPatch) {
        await ctx.db.patch(m._id, {
          phone: m.phone ?? "",
          bio: m.bio ?? "",
          image: m.image ?? "",
          termEnd: m.termEnd ?? "",
          updatedAt: Date.now(),
        });
        updated++;
      }
    }
    return { total: members.length, updated };
  },
});