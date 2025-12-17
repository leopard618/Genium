import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get all properties
export const getAllProperties = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();
    return properties;
  },
});

// Get properties by status
export const getPropertiesByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return properties;
  },
});

// Get cheapest available property
export const getCheapestProperty = query({
  args: { 
    bedrooms: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let properties = await ctx.db
      .query("properties")
      .withIndex("by_price")
      .collect();

    // Filter by status (default to available)
    const status = args.status || "available";
    properties = properties.filter((p) => p.status === status);

    // Filter by bedrooms if specified
    if (args.bedrooms !== undefined) {
      properties = properties.filter((p) => p.bedrooms === args.bedrooms);
    }

    // Sort by price ascending
    properties.sort((a, b) => a.price - b.price);

    return properties[0] || null;
  },
});

// Get property by ID
export const getProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.propertyId);
  },
});

// Search properties by criteria
export const searchProperties = query({
  args: {
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let properties = await ctx.db.query("properties").collect();

    // Apply filters
    if (args.minPrice !== undefined) {
      properties = properties.filter((p) => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      properties = properties.filter((p) => p.price <= args.maxPrice!);
    }
    if (args.bedrooms !== undefined) {
      properties = properties.filter((p) => p.bedrooms === args.bedrooms);
    }
    if (args.status !== undefined) {
      properties = properties.filter((p) => p.status === args.status);
    }

    return properties;
  },
});

// Vector search for properties (RAG)
export const vectorSearchProperties = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const results = await ctx.vectorSearch("properties", "by_embedding", {
      vector: args.embedding,
      limit: args.limit || 5,
      filter: (q: any) => q.eq("status", "available"),
    });

    const propertiesWithScores: any[] = await Promise.all(
      results.map(async (result: any) => {
        const property: any = await ctx.runQuery(api.properties.getProperty, {
          propertyId: result._id,
        });
        return {
          ...property,
          score: result._score,
        };
      })
    );

    return propertiesWithScores;
  },
});

// Update property
export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    updates: v.object({
      status: v.optional(v.string()),
      price: v.optional(v.number()),
      description: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.propertyId, args.updates);
  },
});

// Add embedding to property
export const addEmbedding = mutation({
  args: {
    propertyId: v.id("properties"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.propertyId, {
      embedding: args.embedding,
    });
  },
});

