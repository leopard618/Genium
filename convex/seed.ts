import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed the database with initial data
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingProperties = await ctx.db.query("properties").first();
    if (existingProperties) {
      return { message: "Database already seeded" };
    }

    // Seed properties for "Sunset Heights" project
    const properties = [
      {
        projectName: "Sunset Heights",
        unitType: "2BR",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        price: 298000,
        floor: 3,
        status: "available",
        description: "Spacious 2-bedroom unit with city views, modern finishes, and open-concept living. Includes parking and storage.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "3BR",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
        price: 425000,
        floor: 5,
        status: "available",
        description: "Premium 3-bedroom corner unit with panoramic views, gourmet kitchen, and spacious balcony.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "Studio",
        bedrooms: 0,
        bathrooms: 1,
        sqft: 600,
        price: 185000,
        floor: 2,
        status: "available",
        description: "Efficient studio apartment perfect for young professionals. Modern amenities and great location.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "2BR",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1150,
        price: 315000,
        floor: 7,
        status: "available",
        description: "High-floor 2-bedroom with upgraded appliances and in-suite laundry. Pet-friendly building.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "3BR",
        bedrooms: 3,
        bathrooms: 3,
        sqft: 1800,
        price: 550000,
        floor: 10,
        status: "available",
        description: "Luxury penthouse-style 3-bedroom with 3 bathrooms, walk-in closets, and premium finishes throughout.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "1BR",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 800,
        price: 225000,
        floor: 4,
        status: "available",
        description: "Well-designed 1-bedroom with efficient layout, large windows, and access to building amenities.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "2BR",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1250,
        price: 335000,
        floor: 6,
        status: "reserved",
        description: "Modern 2-bedroom with open kitchen, granite countertops, and city views.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "3BR",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1600,
        price: 475000,
        floor: 8,
        status: "available",
        description: "Family-friendly 3-bedroom with extra storage, large living area, and near schools.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "1BR",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        price: 210000,
        floor: 1,
        status: "available",
        description: "Ground-floor 1-bedroom with private patio access. Perfect for those who prefer easy access.",
      },
      {
        projectName: "Sunset Heights",
        unitType: "2BR",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1300,
        price: 345000,
        floor: 9,
        status: "available",
        description: "Top-floor 2-bedroom with vaulted ceilings, skylights, and modern kitchen with island.",
      },
    ];

    for (const property of properties) {
      await ctx.db.insert("properties", property);
    }

    // Seed authorized brokers
    const brokers = [
      {
        phoneNumber: "+1234567890",
        name: "John Smith",
        email: "john.smith@realty.com",
        authorized: true,
        createdAt: Date.now(),
      },
      {
        phoneNumber: "+0987654321",
        name: "Sarah Johnson",
        email: "sarah.j@realty.com",
        authorized: true,
        createdAt: Date.now(),
      },
      {
        phoneNumber: "+1122334455",
        name: "Mike Chen",
        email: "mchen@realty.com",
        authorized: true,
        createdAt: Date.now(),
      },
    ];

    for (const broker of brokers) {
      await ctx.db.insert("brokers", broker);
    }

    // Seed configuration
    await ctx.db.insert("config", {
      key: "confidence_threshold",
      value: "0.9",
      description: "Minimum confidence score for RAG responses",
    });

    await ctx.db.insert("config", {
      key: "openai_model",
      value: "gpt-4",
      description: "OpenAI model for answer formatting",
    });

    return {
      message: "Database seeded successfully",
      propertiesCount: properties.length,
      brokersCount: brokers.length,
    };
  },
});

// Clear all data (use with caution)
export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all messages
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all conversations
    const conversations = await ctx.db.query("conversations").collect();
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    // Delete all properties
    const properties = await ctx.db.query("properties").collect();
    for (const property of properties) {
      await ctx.db.delete(property._id);
    }

    // Delete all brokers
    const brokers = await ctx.db.query("brokers").collect();
    for (const broker of brokers) {
      await ctx.db.delete(broker._id);
    }

    // Delete all config
    const configs = await ctx.db.query("config").collect();
    for (const config of configs) {
      await ctx.db.delete(config._id);
    }

    return { message: "Database cleared successfully" };
  },
});

