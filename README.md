# Genium - WhatsApp Real Estate Assistant

Genium is an AI-powered WhatsApp chatbot for real estate brokers that provides instant, high-confidence answers about property listings using RAG (Retrieval Augmented Generation) technology.

## Features

- 🤖 **Intelligent Query Processing**: Automatically classifies and routes queries for optimal responses
- 🔍 **Vector Search (RAG)**: Semantic search through property listings using OpenAI embeddings
- 📱 **WhatsApp Integration**: Seamless integration via Evolution API
- 🔐 **Broker Authorization**: Phone number-based authentication system
- 📊 **Admin Dashboard**: Beautiful UI for managing properties, brokers, and viewing conversations
- ⚡ **Real-time Updates**: Built with Convex for instant data synchronization

## Architecture

### Core Components

1. **Convex Backend**
   - Schema for properties, brokers, messages, and conversations
   - Vector embeddings for semantic search
   - Real-time data synchronization

2. **RAG Pipeline**
   - OpenAI embeddings (text-embedding-ada-002)
   - Vector similarity search with confidence scoring
   - LLM-powered answer formatting (GPT-4)

3. **WhatsApp Integration**
   - Evolution API webhook handling
   - Inbound/outbound message processing
   - Automatic response generation

4. **Admin Dashboard**
   - Properties management and visualization
   - Broker authorization controls
   - Conversation history viewer
   - Test query interface

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Convex account (free tier available)
- Evolution API instance (for WhatsApp integration)

### Installation

1. **Clone and Install Dependencies**

```bash
cd my-app
npm install
```

2. **Install Additional Dependencies**

```bash
npm install convex@latest
```

3. **Set Up Convex**

```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing one)
- Generate your `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex development server

4. **Configure Environment Variables**

Create a `.env.local` file in the `my-app` directory:

```env
# Convex (provided by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Evolution API (WhatsApp Integration)
EVOLUTION_API_URL=https://your-evolution-api-url.com
EVOLUTION_API_KEY=your-evolution-api-key
EVOLUTION_INSTANCE_NAME=your-instance-name
```

5. **Set Convex Environment Variables**

```bash
npx convex env set OPENAI_API_KEY sk-your-openai-api-key-here
npx convex env set EVOLUTION_API_URL https://your-evolution-api-url.com
npx convex env set EVOLUTION_API_KEY your-evolution-api-key
```

6. **Start the Development Server**

In a separate terminal:

```bash
npm run dev
```

7. **Access the Dashboard**

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Initial Setup Steps

1. **Seed the Database**
   - Navigate to the "Properties" tab
   - Click "Seed Database" to populate with sample properties
   - Click "Generate Embeddings" to create vector embeddings for RAG

2. **Add Authorized Brokers**
   - Go to the "Brokers" tab
   - Click "Add Broker" and enter broker details
   - Use format `+1234567890` for phone numbers

3. **Test the System**
   - Go to the "Test Query" tab
   - Select an authorized broker
   - Try sample queries like "What is the cheapest residential unit available?"

### WhatsApp Integration

#### Set Up Evolution API Webhook

1. Configure your Evolution API instance webhook URL:
   ```
   https://your-deployment.convex.site/webhook/whatsapp
   ```

2. Your Convex deployment URL is shown when you run `npx convex dev`

3. Ensure your webhook is configured to forward `messages.upsert` events

#### Test WhatsApp Integration

Send a WhatsApp message from an authorized broker's number:
```
What is the cheapest 2 bedroom unit available?
```

The bot should respond with property details.

## Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with Convex provider
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PropertiesTab.tsx  # Properties management
│   ├── BrokersTab.tsx     # Brokers management
│   ├── ConversationsTab.tsx # Conversation viewer
│   └── TestQueryTab.tsx   # Query testing interface
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── seed.ts            # Seed data functions
│   ├── brokers.ts         # Broker queries/mutations
│   ├── properties.ts      # Property queries/mutations
│   ├── messages.ts        # Message handling
│   ├── rag.ts             # RAG pipeline
│   └── http.ts            # HTTP endpoints (webhooks)
├── layout/                # Layout components
│   ├── header.tsx         # Header component
│   └── footer.tsx         # Footer component
└── lib/                   # Utilities
    └── convex.tsx         # Convex client provider
```

## Usage

### Query Types

The system intelligently routes queries:

1. **Price Queries** (Deterministic)
   - "What is the cheapest unit?"
   - "Show me the most affordable 2 bedroom"
   - Returns exact price matches with 100% confidence

2. **General Queries** (Vector Search)
   - "Do you have units with city views?"
   - "Tell me about top floor units"
   - Uses RAG with confidence threshold (default 0.85)

### API Endpoints

#### Test Query Endpoint
```bash
curl -X POST https://your-deployment.convex.site/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the cheapest unit?",
    "phoneNumber": "+1234567890"
  }'
```

#### WhatsApp Webhook
```bash
POST https://your-deployment.convex.site/webhook/whatsapp
```

Automatically processes Evolution API webhook events.

## Configuration

### Confidence Threshold

Adjust the minimum confidence score for RAG responses in the `config` table:
- Default: 0.9 (90%)
- Queries below threshold receive a fallback response

### OpenAI Models

- Embeddings: `text-embedding-ada-002`
- Answer Formatting: `gpt-4`

Change models in `convex/rag.ts` as needed.

## Deployment

### Deploy to Production

1. **Deploy Convex**
```bash
npx convex deploy
```

2. **Deploy Next.js** (Vercel recommended)
```bash
npm run build
```

Follow your hosting provider's deployment instructions.

3. **Update Environment Variables**

Set production environment variables in:
- Convex dashboard for backend variables
- Vercel/hosting provider for frontend variables

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not configured"**
   - Run: `npx convex env set OPENAI_API_KEY sk-your-key`

2. **Embeddings not generating**
   - Check OpenAI API key is valid
   - Ensure you have API credits
   - Check Convex logs: `npx convex logs`

3. **WhatsApp webhook not working**
   - Verify webhook URL in Evolution API
   - Check Convex deployment is live
   - View webhook logs in Convex dashboard

4. **"Unauthorized" responses**
   - Ensure broker phone number is in correct format (`+1234567890`)
   - Check broker is marked as "Authorized" in dashboard

## Development

### Run in Development Mode

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

### Clear Database

Use the Convex dashboard or call:
```javascript
await clearDatabase()
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (serverless)
- **AI/ML**: OpenAI (GPT-4, Ada-002 embeddings)
- **WhatsApp**: Evolution API
- **Language**: TypeScript

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact support.

---

Built with ❤️ using AI (Claude Code)
