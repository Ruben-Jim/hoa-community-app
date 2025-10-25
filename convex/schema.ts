import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boardMembers: defineTable({
    name: v.string(),
    position: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    termEnd: v.optional(v.string()),
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
    userId: v.optional(v.string()), // Link to homeowner
    year: v.optional(v.number()), // For annual fees
    address: v.optional(v.string()), // Property address for fines
    reason: v.optional(v.string()), // Reason for fine
    type: v.optional(v.string()), // 'Fee' or 'Fine'
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("Paid"),
      v.literal("Overdue")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_type", ["type"]),

  fines: defineTable({
    violation: v.string(),
    amount: v.number(),
    dateIssued: v.string(),
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
    images: v.optional(v.array(v.string())), // Array of image URLs
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
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.string(),
    unitNumber: v.optional(v.string()),
    isResident: v.boolean(),
    isBoardMember: v.boolean(),
    isRenter: v.boolean(),
    isDev: v.optional(v.boolean()),
    isActive: v.boolean(),
    isBlocked: v.boolean(),
    blockReason: v.optional(v.string()),
    password: v.optional(v.string()), // In production, this should be hashed
    profileImage: v.optional(v.string()), // URL to profile image
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  payments: defineTable({
    userId: v.string(),
    feeType: v.string(),
    amount: v.number(),
    paymentDate: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Paid"),
      v.literal("Overdue")
    ),
    paymentMethod: v.union(
      v.literal("Stripe"),
      v.literal("PayPal"),      // Future
      v.literal("ApplePay"),    // Future
      v.literal("GooglePay")    // Future
    ),
    transactionId: v.string(),             // Stripe payment_intent ID
    paymentIntentId: v.optional(v.string()), // Stripe-specific
    feeId: v.optional(v.id("fees")),
    fineId: v.optional(v.id("fines")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_transaction", ["transactionId"]),

  polls: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    options: v.array(v.string()), // Array of poll options
    isActive: v.boolean(),
    allowMultipleVotes: v.boolean(),
    expiresAt: v.optional(v.number()), // Optional expiration timestamp
    createdBy: v.string(), // Admin/board member who created the poll
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]),

  pollVotes: defineTable({
    pollId: v.id("polls"),
    userId: v.string(), // Resident ID who voted
    selectedOptions: v.array(v.number()), // Array of option indices
    createdAt: v.number(),
  }).index("by_poll", ["pollId"]).index("by_user", ["userId"]),
}); 