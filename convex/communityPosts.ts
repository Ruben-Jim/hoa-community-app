import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("communityPosts")
      .order("desc")
      .collect();
    
    // Get comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("asc")
          .collect();
        return { ...post, comments };
      })
    );
    
    return postsWithComments;
  },
});

export const getByCategory = query({
  args: { category: v.union(
    v.literal("General"),
    v.literal("Event"),
    v.literal("Complaint"),
    v.literal("Suggestion"),
    v.literal("Lost & Found")
  ) },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
    
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("asc")
          .collect();
        return { ...post, comments };
      })
    );
    
    return postsWithComments;
  },
});

export const getById = query({
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;
    
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .order("asc")
      .collect();
    
    return { ...post, comments };
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postId = await ctx.db.insert("communityPosts", {
      ...args,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    });
    return postId;
  },
});

export const update = mutation({
  args: {
    id: v.id("communityPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("General"),
      v.literal("Event"),
      v.literal("Complaint"),
      v.literal("Suggestion"),
      v.literal("Lost & Found")
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
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    // Delete all comments for this post first
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    
    // Delete the post
    await ctx.db.delete(args.id);
  },
});

export const like = mutation({
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");
    
    await ctx.db.patch(args.id, {
      likes: post.likes + 1,
      updatedAt: Date.now(),
    });
  },
});

// Comments functions
export const addComment = mutation({
  args: {
    postId: v.id("communityPosts"),
    author: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const commentId = await ctx.db.insert("comments", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return commentId;
  },
});

export const removeComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all comments for admin management
export const getAllComments = query({
  args: {},
  handler: async (ctx) => {
    const comments = await ctx.db
      .query("comments")
      .order("desc")
      .collect();
    
    // Get post information for each comment
    const commentsWithPosts = await Promise.all(
      comments.map(async (comment) => {
        const post = await ctx.db.get(comment.postId);
        return { ...comment, postTitle: post?.title || 'Deleted Post' };
      })
    );
    
    return commentsWithPosts;
  },
}); 