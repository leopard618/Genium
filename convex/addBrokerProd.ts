import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Temporary function to add broker to production
export const addProductionBroker = mutation({
  args: {
    phoneNumber: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if broker already exists
    const existing = await ctx.db
      .query("brokers")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (existing) {
      // Update to authorized
      await ctx.db.patch(existing._id, {
        authorized: true,
      });
      return { message: "Broker updated to authorized", brokerId: existing._id };
    }

    // Add new broker
    const brokerId = await ctx.db.insert("brokers", {
      phoneNumber: args.phoneNumber,
      name: args.name,
      email: args.email,
      authorized: true,
      createdAt: Date.now(),
    });

    return { message: "Broker added successfully", brokerId };
  },
});

