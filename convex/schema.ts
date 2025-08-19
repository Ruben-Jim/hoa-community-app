import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boardMembers: defineTable({
    name: v.string(),
    position: v.string(),
    email: v.string(),
    phone: v.string(),
    image: v.optional(v.string()),
    termEnd: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  covenants: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Architecture"),
      v.literal("Landscaping"),
      v.literal("Parking"),
      v.literal("Pets"),
      v.literal("General")
    ),
    lastUpdated: v.string(),
    pdfUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  fees: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  fines: defineTable({
    violation: v.string(),
    amount: v.number(),
    dateIssued: v.string(),
    dueDate: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Paid"),
      v.literal("Overdue")
    ),
    description: v.string(),
    residentId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  communityPosts: defineTable({
    author: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("General"),
      v.literal("Event"),
      v.literal("Complaint"),
      v.literal("Suggestion"),
      v.literal("Lost & Found")
    ),
    likes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  comments: defineTable({
    postId: v.id("communityPosts"),
    author: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_post", ["postId"]),

  emergencyNotifications: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]).index("by_category", ["category"]).index("by_priority", ["priority"]),

  hoaInfo: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    officeHours: v.string(),
    emergencyContact: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  residents: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
}); 