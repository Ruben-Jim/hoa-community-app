import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all polls
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const polls = await ctx.db
      .query("polls")
      .order("desc")
      .collect();
    
    // Batch fetch all votes for all polls at once
    const pollIds = polls.map(poll => poll._id);
    const allVotes = await ctx.db
          .query("pollVotes")
          .collect();
    
    // Group votes by pollId
    const votesByPollId = new Map();
    allVotes.forEach(vote => {
      if (pollIds.includes(vote.pollId)) {
        if (!votesByPollId.has(vote.pollId)) {
          votesByPollId.set(vote.pollId, []);
        }
        votesByPollId.get(vote.pollId).push(vote);
      }
    });
    
    // Calculate vote counts for each poll using the grouped votes
    const pollsWithVotes = polls.map((poll) => {
      const votes = votesByPollId.get(poll._id) || [];
        
        // Calculate vote counts for each option
        const optionVotes = poll.options.map((_, index) => {
        return votes.filter((vote: any) => vote.selectedOptions.includes(index)).length;
        });
        
        const totalVotes = votes.length;
        
        // Calculate winning option(s) - handle ties
        let winningOption = null;
        let isTied = false;
        if (totalVotes > 0) {
          const maxVotes = Math.max(...optionVotes);
          const winningIndices = optionVotes.map((votes, index) => votes === maxVotes ? index : -1).filter(index => index !== -1);
          
          if (winningIndices.length > 0) {
            // Check if there's a tie (multiple options with same max votes)
            isTied = winningIndices.length > 1;
            
            // For ties, we'll show the first winning option but mark it as tied
            const winningIndex = winningIndices[0];
            winningOption = {
              index: winningIndex,
              option: poll.options[winningIndex],
              votes: maxVotes,
              percentage: (maxVotes / totalVotes) * 100,
              isTied: isTied,
              tiedIndices: winningIndices
            };
          }
        }
        
        return {
          ...poll,
          optionVotes,
          totalVotes,
          winningOption,
        };
    });
    
    return pollsWithVotes;
  },
});

// Get paginated polls
export const getPaginated = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;
    
    // Get total count
    const allPolls = await ctx.db
      .query("polls")
      .order("desc")
      .collect();
    const total = allPolls.length;
    
    // Get paginated polls
    const polls = await ctx.db
      .query("polls")
      .order("desc")
      .collect();
    
    const paginatedPolls = polls.slice(offset, offset + limit);
    
    // Batch fetch all votes for all paginated polls at once
    const pollIds = paginatedPolls.map(poll => poll._id);
    const allVotes = await ctx.db
      .query("pollVotes")
      .collect();
    
    // Group votes by pollId
    const votesByPollId = new Map();
    allVotes.forEach(vote => {
      if (pollIds.includes(vote.pollId)) {
        if (!votesByPollId.has(vote.pollId)) {
          votesByPollId.set(vote.pollId, []);
        }
        votesByPollId.get(vote.pollId).push(vote);
      }
    });
    
    // Calculate vote counts for each poll using the grouped votes
    const pollsWithVotes = paginatedPolls.map((poll) => {
      const votes = votesByPollId.get(poll._id) || [];
      
      // Calculate vote counts for each option
      const optionVotes = poll.options.map((_, index) => {
        return votes.filter((vote: any) => vote.selectedOptions.includes(index)).length;
      });
      
      const totalVotes = votes.length;
      
      // Calculate winning option(s) - handle ties
      let winningOption = null;
      let isTied = false;
      if (totalVotes > 0) {
        const maxVotes = Math.max(...optionVotes);
        const winningIndices = optionVotes.map((votes, index) => votes === maxVotes ? index : -1).filter(index => index !== -1);
        
        if (winningIndices.length > 0) {
          // Check if there's a tie (multiple options with same max votes)
          isTied = winningIndices.length > 1;
          
          // For ties, we'll show the first winning option but mark it as tied
          const winningIndex = winningIndices[0];
          winningOption = {
            index: winningIndex,
            option: poll.options[winningIndex],
            votes: maxVotes,
            percentage: (maxVotes / totalVotes) * 100,
            isTied: isTied,
            tiedIndices: winningIndices
          };
        }
      }
      
      return {
        ...poll,
        optionVotes,
        totalVotes,
        winningOption,
      };
    });
    
    return {
      items: pollsWithVotes,
      total,
    };
  },
});

// Get active polls only
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
    
    // Filter out expired polls
    const now = Date.now();
    const activePolls = polls.filter(poll => 
      !poll.expiresAt || poll.expiresAt > now
    );
    
    // Batch fetch all votes for all active polls at once
    const pollIds = activePolls.map(poll => poll._id);
    const allVotes = await ctx.db
          .query("pollVotes")
          .collect();
    
    // Group votes by pollId
    const votesByPollId = new Map();
    allVotes.forEach(vote => {
      if (pollIds.includes(vote.pollId)) {
        if (!votesByPollId.has(vote.pollId)) {
          votesByPollId.set(vote.pollId, []);
        }
        votesByPollId.get(vote.pollId).push(vote);
      }
    });
    
    // Calculate vote counts for each poll using the grouped votes
    const pollsWithVotes = activePolls.map((poll) => {
      const votes = votesByPollId.get(poll._id) || [];
        
        // Calculate vote counts for each option
        const optionVotes = poll.options.map((_, index) => {
        return votes.filter((vote: any) => vote.selectedOptions.includes(index)).length;
        });
        
        const totalVotes = votes.length;
        
        // Calculate winning option(s) - handle ties
        let winningOption = null;
        let isTied = false;
        if (totalVotes > 0) {
          const maxVotes = Math.max(...optionVotes);
          const winningIndices = optionVotes.map((votes, index) => votes === maxVotes ? index : -1).filter(index => index !== -1);
          
          if (winningIndices.length > 0) {
            // Check if there's a tie (multiple options with same max votes)
            isTied = winningIndices.length > 1;
            
            // For ties, we'll show the first winning option but mark it as tied
            const winningIndex = winningIndices[0];
            winningOption = {
              index: winningIndex,
              option: poll.options[winningIndex],
              votes: maxVotes,
              percentage: (maxVotes / totalVotes) * 100,
              isTied: isTied,
              tiedIndices: winningIndices
            };
          }
        }
        
        return {
          ...poll,
          optionVotes,
          totalVotes,
          winningOption,
        };
    });
    
    return pollsWithVotes;
  },
});

// Get a specific poll by ID
export const getById = query({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.id);
    if (!poll) return null;
    
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.id))
      .collect();
    
    // Calculate vote counts for each option
    const optionVotes = poll.options.map((_, index) => {
      return votes.filter(vote => vote.selectedOptions.includes(index)).length;
    });
    
    const totalVotes = votes.length;
    
    // Calculate winning option
    let winningOption = null;
    if (totalVotes > 0) {
      const maxVotes = Math.max(...optionVotes);
      const winningIndex = optionVotes.findIndex(votes => votes === maxVotes);
      if (winningIndex !== -1) {
        winningOption = {
          index: winningIndex,
          option: poll.options[winningIndex],
          votes: maxVotes,
          percentage: (maxVotes / totalVotes) * 100
        };
      }
    }
    
    return {
      ...poll,
      optionVotes,
      totalVotes,
      winningOption,
    };
  },
});

// Create a new poll
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    options: v.array(v.string()),
    allowMultipleVotes: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.options.length < 2) {
      throw new Error("Poll must have at least 2 options");
    }
    
    if (args.options.length > 10) {
      throw new Error("Poll cannot have more than 10 options");
    }
    
    const now = Date.now();
    const pollId = await ctx.db.insert("polls", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return pollId;
  },
});

// Update a poll
export const update = mutation({
  args: {
    id: v.id("polls"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    allowMultipleVotes: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    if (updates.options && updates.options.length < 2) {
      throw new Error("Poll must have at least 2 options");
    }
    
    if (updates.options && updates.options.length > 10) {
      throw new Error("Poll cannot have more than 10 options");
    }
    
    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

// Delete a poll
export const remove = mutation({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    // Delete all votes for this poll first
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.id))
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    
    // Delete the poll
    await ctx.db.delete(args.id);
  },
});

// Vote on a poll
export const vote = mutation({
  args: {
    pollId: v.id("polls"),
    userId: v.string(),
    selectedOptions: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }
    
    if (!poll.isActive) {
      throw new Error("Poll is not active");
    }
    
    // Check if poll has expired
    if (poll.expiresAt && poll.expiresAt < Date.now()) {
      throw new Error("Poll has expired");
    }
    
    // Validate selected options
    for (const optionIndex of args.selectedOptions) {
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new Error("Invalid option selected");
      }
    }
    
    // Check if multiple votes are allowed
    if (!poll.allowMultipleVotes && args.selectedOptions.length > 1) {
      throw new Error("Multiple votes not allowed for this poll");
    }
    
    // Check if user has already voted
    const existingVote = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, {
        selectedOptions: args.selectedOptions,
      });
    } else {
      // Create new vote
      await ctx.db.insert("pollVotes", {
        pollId: args.pollId,
        userId: args.userId,
        selectedOptions: args.selectedOptions,
        createdAt: Date.now(),
      });
    }
  },
});

// Get user's vote for a specific poll
export const getUserVote = query({
  args: {
    pollId: v.id("polls"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    return vote;
  },
});

// Get all votes for a poll (admin only)
export const getPollVotes = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();
    
    return votes;
  },
});

// Get all user votes for all polls
export const getAllUserVotes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Convert to a map for easy lookup
    const votesMap: { [pollId: string]: number[] } = {};
    votes.forEach(vote => {
      votesMap[vote.pollId] = vote.selectedOptions;
    });
    
    return votesMap;
  },
});

// Toggle poll active status
export const toggleActive = mutation({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.id);
    if (!poll) {
      throw new Error("Poll not found");
    }
    
    await ctx.db.patch(args.id, {
      isActive: !poll.isActive,
      updatedAt: Date.now(),
    });
  },
});
