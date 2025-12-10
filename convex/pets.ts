import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all pets
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const pets = await ctx.db
      .query("pets")
      .order("desc")
      .collect();
    
    // Batch fetch all unique resident IDs
    const residentIds = [...new Set(pets.map(pet => pet.residentId))];
    
    // Fetch all residents in parallel
    const residents = await Promise.all(
      residentIds.map(id => ctx.db.get(id))
    );
    
    // Create a map for quick lookup by ID
    const residentsById = new Map();
    residents.forEach(resident => {
      if (resident) {
        residentsById.set(resident._id, resident);
      }
    });
    
    // Join with resident data using the map
    const petsWithResidentInfo = pets.map((pet) => {
      const resident = residentsById.get(pet.residentId);
        return {
          ...pet,
          residentName: resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown',
          residentAddress: resident 
            ? `${resident.address}${resident.unitNumber ? ` #${resident.unitNumber}` : ''}` 
            : '',
          profileImage: resident?.profileImage || null,
        };
    });
    
    return petsWithResidentInfo;
  },
});

// Get pets by resident
export const getByResident = query({
  args: {
    residentId: v.id("residents"),
  },
  handler: async (ctx, args) => {
    const pets = await ctx.db
      .query("pets")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .order("desc")
      .collect();
    
    return pets;
  },
});

// Create a new pet
export const create = mutation({
  args: {
    residentId: v.id("residents"),
    name: v.string(),
    image: v.string(), // Storage ID
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const petId = await ctx.db.insert("pets", {
      residentId: args.residentId,
      name: args.name,
      image: args.image,
      createdAt: now,
      updatedAt: now,
    });

    return petId;
  },
});

// Update a pet
export const update = mutation({
  args: {
    id: v.id("pets"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
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

// Delete a pet
export const remove = mutation({
  args: {
    id: v.id("pets"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

