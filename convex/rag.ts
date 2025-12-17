import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate embeddings for properties
export const generatePropertyEmbeddings = action({
  args: {},
  handler: async (ctx) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const properties = await ctx.runQuery(api.properties.getAllProperties);
    
    for (const property of properties) {
      // Skip if already has embedding
      if (property.embedding) continue;

      // Create text representation for embedding
      const text = `${property.unitType} unit with ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.sqft} sqft. Price: $${property.price}. ${property.description}`;

      try {
        // Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            input: text,
            model: "text-embedding-ada-002",
          }),
        });

        if (!response.ok) {
          console.error(`Failed to generate embedding for property ${property._id}`);
          continue;
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;

        // Store embedding
        await ctx.runMutation(api.properties.addEmbedding, {
          propertyId: property._id,
          embedding,
        });
      } catch (error) {
        console.error(`Error generating embedding for property ${property._id}:`, error);
      }
    }

    return { message: "Embeddings generated successfully" };
  },
});

// Generate embedding for a query
export const generateQueryEmbedding = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          input: args.query,
          model: "text-embedding-ada-002",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate query embedding");
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error generating query embedding:", error);
      throw error;
    }
  },
});

// Process query with RAG pipeline
export const processQuery = action({
  args: {
    query: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // 1. Check authorization
    const authResult = await ctx.runQuery(api.brokers.isAuthorized, {
      phoneNumber: args.phoneNumber,
    });

    if (!authResult.authorized || !authResult.broker) {
      return {
        success: false,
        message: "Unauthorized. Please contact support to authorize your number.",
      };
    }

    const broker = authResult.broker;

    // 2. Determine query type
    const queryType = classifyQuery(args.query);

    let response = "";
    let confidence = 0;
    let propertyId: any = undefined;

    // 3. Route based on query type
    if (queryType === "price_cheapest") {
      // Deterministic price query
      const property: any = await ctx.runQuery(api.properties.getCheapestProperty, {
        status: "available",
      });

      if (property) {
        response = `The most affordable unit is $${property.price.toLocaleString()} - ${property.bedrooms} bedrooms.`;
        confidence = 1.0;
        propertyId = property._id;
      } else {
        response = "Sorry, no available units at the moment.";
        confidence = 1.0;
      }
    } else if (queryType === "price_bedrooms") {
      // Price query with bedroom filter
      const bedroomCount = extractBedroomCount(args.query);
      const property: any = await ctx.runQuery(api.properties.getCheapestProperty, {
        bedrooms: bedroomCount,
        status: "available",
      });

      if (property) {
        response = `The cheapest ${bedroomCount}-bedroom unit is $${property.price.toLocaleString()}.`;
        confidence = 1.0;
        propertyId = property._id;
      } else {
        response = `Sorry, no available ${bedroomCount}-bedroom units at the moment.`;
        confidence = 1.0;
      }
    } else {
      // General query - use vector search
      const embedding: any = await ctx.runAction(api.rag.generateQueryEmbedding, { 
        query: args.query 
      });
      const results: any = await ctx.runAction(api.properties.vectorSearchProperties, {
        embedding,
        limit: 3,
      });

      if (results.length > 0 && results[0].score > 0.85) {
        const topProperty: any = results[0];
        confidence = topProperty.score;
        propertyId = topProperty._id;

        // Format response with LLM
        response = await formatResponseWithLLM(ctx, {
          query: args.query,
          property: topProperty,
        });
      } else {
        response = "I don't have enough information to answer that question accurately. Could you please rephrase or ask about specific unit types or pricing?";
        confidence = 0;
      }
    }

    // 4. Save conversation and messages
    const conversationId = await ctx.runMutation(
      api.messages.getOrCreateConversation,
      {
        brokerId: broker._id,
        phoneNumber: args.phoneNumber,
      }
    );

    // Save inbound message
    await ctx.runMutation(api.messages.addMessage, {
      conversationId,
      brokerId: broker._id,
      direction: "inbound",
      content: args.query,
      queryType,
    });

    // Save outbound message
    await ctx.runMutation(api.messages.addMessage, {
      conversationId,
      brokerId: broker._id,
      direction: "outbound",
      content: response,
      queryType,
      confidence,
      propertyId,
    });

    return {
      success: true,
      message: response,
      confidence,
      queryType,
      propertyId,
    };
  },
});

// Classify query type
function classifyQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Check for cheapest/affordable/lowest price queries
  if (
    (lowerQuery.includes("cheap") ||
      lowerQuery.includes("afford") ||
      lowerQuery.includes("lowest") ||
      lowerQuery.includes("least expensive")) &&
    (lowerQuery.includes("price") ||
      lowerQuery.includes("cost") ||
      lowerQuery.includes("unit") ||
      lowerQuery.includes("available"))
  ) {
    // Check if bedroom count is mentioned
    if (
      lowerQuery.includes("bedroom") ||
      lowerQuery.includes("br") ||
      /\d+\s*bed/.test(lowerQuery)
    ) {
      return "price_bedrooms";
    }
    return "price_cheapest";
  }

  return "general";
}

// Extract bedroom count from query
function extractBedroomCount(query: string): number {
  const match = query.match(/(\d+)\s*(bedroom|br|bed)/i);
  if (match) {
    return parseInt(match[1]);
  }

  // Check for "studio"
  if (query.toLowerCase().includes("studio")) {
    return 0;
  }

  return 2; // Default
}

// Format response using LLM
async function formatResponseWithLLM(
  ctx: any,
  args: { query: string; property: any }
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    // Fallback without LLM
    return `${args.property.unitType} unit - ${args.property.bedrooms} bed, ${args.property.bathrooms} bath, ${args.property.sqft} sqft. Price: $${args.property.price.toLocaleString()}. ${args.property.description}`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful real estate assistant. Provide concise, one-line answers to broker questions about properties. Be professional and direct.",
          },
          {
            role: "user",
            content: `Question: ${args.query}\n\nProperty: ${args.property.unitType}, ${args.property.bedrooms} bed, ${args.property.bathrooms} bath, ${args.property.sqft} sqft, $${args.property.price}. ${args.property.description}\n\nProvide a brief, one-line answer.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error("LLM formatting failed");
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error formatting response with LLM:", error);
    // Fallback
    return `${args.property.unitType} unit - ${args.property.bedrooms} bed, ${args.property.bathrooms} bath, ${args.property.sqft} sqft. Price: $${args.property.price.toLocaleString()}.`;
  }
}

