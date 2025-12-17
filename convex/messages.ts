import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create conversation for a broker
export const getOrCreateConversation = mutation({
  args: {
    brokerId: v.id("brokers"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find existing conversation
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_broker", (q) => q.eq("brokerId", args.brokerId))
      .first();

    if (existingConversation) {
      // Update last message time
      await ctx.db.patch(existingConversation._id, {
        lastMessageAt: Date.now(),
      });
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      brokerId: args.brokerId,
      phoneNumber: args.phoneNumber,
      startedAt: Date.now(),
      lastMessageAt: Date.now(),
      messageCount: 0,
    });

    return conversationId;
  },
});

// Add a message to conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    brokerId: v.id("brokers"),
    direction: v.string(),
    content: v.string(),
    queryType: v.optional(v.string()),
    confidence: v.optional(v.number()),
    propertyId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      brokerId: args.brokerId,
      direction: args.direction,
      content: args.content,
      timestamp: Date.now(),
      queryType: args.queryType,
      confidence: args.confidence,
      propertyId: args.propertyId,
    });

    // Update conversation message count
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        messageCount: conversation.messageCount + 1,
        lastMessageAt: Date.now(),
      });
    }

    return messageId;
  },
});

// Get messages for a conversation
export const getConversationMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});

// Get all conversations
export const getAllConversations = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();
    
    // Enrich with broker info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const broker = await ctx.db.get(conv.brokerId);
        return {
          ...conv,
          brokerName: broker?.name || "Unknown",
        };
      })
    );

    return enrichedConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

// Get conversation by ID
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

// Get recent messages (for dashboard)
export const getRecentMessages = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 50);

    // Enrich with broker info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const broker = await ctx.db.get(msg.brokerId);
        return {
          ...msg,
          brokerName: broker?.name || "Unknown",
        };
      })
    );

    return enrichedMessages;
  },
});

