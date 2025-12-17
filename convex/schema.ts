import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Properties table for real estate units
  properties: defineTable({
    projectName: v.string(),
    unitType: v.string(), // e.g., "2BR", "3BR", "Studio"
    bedrooms: v.number(),
    bathrooms: v.number(),
    sqft: v.number(),
    price: v.number(),
    floor: v.optional(v.number()),
    status: v.string(), // "available", "sold", "reserved"
    description: v.string(),
    embedding: v.optional(v.array(v.float64())), // Vector embedding for RAG
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI ada-002 embedding dimensions
    filterFields: ["status"],
  }).index("by_price", ["price"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_status", ["status"]),

  // Authorized brokers
  brokers: defineTable({
    phoneNumber: v.string(), // Format: +1234567890
    name: v.string(),
    email: v.optional(v.string()),
    authorized: v.boolean(),
    createdAt: v.number(),
  }).index("by_phone", ["phoneNumber"])
    .index("by_authorized", ["authorized"]),

  // Conversation history
  conversations: defineTable({
    brokerId: v.id("brokers"),
    phoneNumber: v.string(),
    startedAt: v.number(),
    lastMessageAt: v.number(),
    messageCount: v.number(),
  }).index("by_broker", ["brokerId"])
    .index("by_phone", ["phoneNumber"]),

  // Individual messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    brokerId: v.id("brokers"),
    direction: v.string(), // "inbound" or "outbound"
    content: v.string(),
    timestamp: v.number(),
    queryType: v.optional(v.string()), // "price", "general", "other"
    confidence: v.optional(v.number()),
    propertyId: v.optional(v.id("properties")),
  }).index("by_conversation", ["conversationId"])
    .index("by_broker", ["brokerId"])
    .index("by_timestamp", ["timestamp"]),

  // System configuration
  config: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
  }).index("by_key", ["key"]),
});

