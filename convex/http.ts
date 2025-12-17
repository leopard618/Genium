import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// WhatsApp webhook for Evolution API & Maytapi
http.route({
  path: "/webhook/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      console.log("📥 Webhook received:", JSON.stringify(body, null, 2));
      
      let fromNumber = "";
      let messageText = "";
      let webhookType = "unknown";

      // Detect webhook type and extract data
      
      // MAYTAPI FORMAT
      if (body.type === "message" || body.conversation || body.user) {
        webhookType = "maytapi";
        console.log("🔵 Maytapi webhook detected");
        
        // Extract phone number from Maytapi (multiple sources)
        fromNumber = body.user?.phone || 
                     body.conversation?.split("@")[0] || 
                     body.user?.id?.split("@")[0] || "";
        
        // Clean phone number (remove any @ or .us suffixes)
        fromNumber = fromNumber.replace(/@.*$/, "").trim();
        
        // Extract message text from Maytapi
        messageText = body.message?.text || 
                     body.message?.message?.text || 
                     body.message || "";
        
        // Skip if it's an outgoing message
        if (body.fromMe === true || body.from_me === true) {
          console.log("⚠️ Skipping - outgoing message");
          return new Response(JSON.stringify({ success: true, skipped: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      // EVOLUTION API FORMAT
      else if (body.event === "messages.upsert" || body.event === "message.received") {
        webhookType = "evolution";
        console.log("🟢 Evolution API webhook detected");
        
        const data = body.data;
        const message = data.message || data;
        
        // Extract phone number (Evolution API)
        fromNumber = message.key?.remoteJid?.replace("@s.whatsapp.net", "") || 
                    message.key?.remoteJid?.split("@")[0] ||
                    message.from?.replace("@s.whatsapp.net", "") ||
                    message.from?.split("@")[0] || "";
        
        // Extract message text (Evolution API)
        messageText = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text ||
                     message.message?.imageMessage?.caption ||
                     message.text || "";
      }

      console.log("📱 From:", fromNumber);
      console.log("💬 Message:", messageText);
      console.log("🔖 Type:", webhookType);

      // Validate we have required data
      if (!fromNumber || !messageText) {
        console.log("⚠️ Skipping - missing phone or text");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Format phone number (add + if not present)
      const phoneNumber = fromNumber.startsWith("+") ? fromNumber : `+${fromNumber}`;

      // Process the query through RAG pipeline
      console.log("🤖 Processing query for:", phoneNumber);
      const result = await ctx.runAction(api.rag.processQuery, {
        query: messageText,
        phoneNumber,
      });

      console.log("✅ Query result:", result);

      // Send response via WhatsApp API
      if (result.success && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
        console.log("📤 Sending response to WhatsApp");
        
        try {
          let whatsappResponse;
          
          // MAYTAPI SEND
          if (webhookType === "maytapi" || process.env.WHATSAPP_PROVIDER === "maytapi") {
            const productId = process.env.MAYTAPI_PRODUCT_ID;
            const phoneId = process.env.MAYTAPI_PHONE_ID;
            const apiUrl = `https://api.maytapi.com/api/${productId}/${phoneId}/sendMessage`;
            
            console.log("🔵 Sending via Maytapi:", apiUrl);
            
            whatsappResponse = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-maytapi-key": process.env.WHATSAPP_API_KEY,
              },
              body: JSON.stringify({
                to_number: fromNumber,
                message: result.message,
                type: "text",
              }),
            });
          }
          // EVOLUTION API SEND
          else {
            const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "default";
            const apiUrl = `${process.env.WHATSAPP_API_URL}/message/sendText/${instanceName}`;
            
            console.log("🟢 Sending via Evolution API:", apiUrl);
            
            whatsappResponse = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": process.env.WHATSAPP_API_KEY,
              },
              body: JSON.stringify({
                number: fromNumber,
                text: result.message,
                delay: 1000,
              }),
            });
          }

          if (!whatsappResponse.ok) {
            const errorText = await whatsappResponse.text();
            console.error("❌ WhatsApp send failed:", errorText);
          } else {
            console.log("✅ Response sent to WhatsApp");
          }
        } catch (error) {
          console.error("❌ Failed to send WhatsApp response:", error);
        }
      } else {
        console.log("⚠️ WhatsApp API not configured - response not sent");
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("❌ Webhook error:", error);
      return new Response(JSON.stringify({ 
        error: "Internal server error",
        message: error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Test endpoint
http.route({
  path: "/test",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ message: "Genium API is running" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Query endpoint (for testing without WhatsApp)
http.route({
  path: "/query",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { query, phoneNumber } = await request.json();

      if (!query || !phoneNumber) {
        return new Response(
          JSON.stringify({ error: "Missing query or phoneNumber" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const result = await ctx.runAction(api.rag.processQuery, {
        query,
        phoneNumber,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;

