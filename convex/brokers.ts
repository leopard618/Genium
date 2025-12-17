import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Check if a phone number is authorized
export const isAuthorized = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const broker = await ctx.db
      .query("brokers")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    return {
      authorized: broker?.authorized || false,
      broker: broker || null,
    };
  },
});

// Get all brokers
export const getAllBrokers = query({
  args: {},
  handler: async (ctx) => {
    const brokers = await ctx.db.query("brokers").collect();
    return brokers;
  },
});

// Get broker by ID
export const getBroker = query({
  args: { brokerId: v.id("brokers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brokerId);
  },
});

// Add a new broker
export const addBroker = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    authorized: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingBroker = await ctx.db
      .query("brokers")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (existingBroker) {
      throw new Error("Broker with this phone number already exists");
    }

    const brokerId = await ctx.db.insert("brokers", {
      phoneNumber: args.phoneNumber,
      name: args.name,
      email: args.email,
      authorized: args.authorized,
      createdAt: Date.now(),
    });

    return brokerId;
  },
});

// Update broker authorization
export const updateBrokerAuth = mutation({
  args: {
    brokerId: v.id("brokers"),
    authorized: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.brokerId, {
      authorized: args.authorized,
    });
  },
});

// Delete broker
export const deleteBroker = mutation({
  args: { brokerId: v.id("brokers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.brokerId);
  },
});

