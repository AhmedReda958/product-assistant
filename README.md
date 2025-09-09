# Product Assistant

AI-powered e-commerce product discovery with chat assistance.

🌐 **Live Demo:** [https://product-assistant-rouge.vercel.app/](https://product-assistant-rouge.vercel.app/)

## What it does

- Browse products with search and filters
- Chat with AI for product recommendations
- Get personalized suggestions based on your needs

## Tech Stack

- **Next.js 15** + **React 19** + **TypeScript**
- **Google Gemini AI** for chat functionality
- **Tailwind CSS** + **Radix UI** for styling
- **Fake Store API** for product data

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env.local
   ```

   Add your Google Gemini API key to `.env.local`:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

3. **Get API key**

   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create project and generate API key

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## API

**POST** `/api/ai/chat` - Chat with AI assistant

The AI analyzes your conversation and recommends products based on:

- Price preferences
- Product categories
- Specific requirements

## How it works

1. **User asks for help** - "I need a laptop under $1000"
2. **AI analyzes request** - Extracts price, category, and keywords
3. **Searches products** - Filters Fake Store API based on preferences
4. **Shows recommendations** - Displays 2-3 relevant products with details

## Current Limitations

- Uses demo product data (Fake Store API)
- No user accounts or saved preferences
- Single AI provider (Google Gemini)

## Future Plans

- User authentication and wishlists
- Real product inventory
- Multiple AI providers
- Mobile app

## Deploy

```bash
npx vercel
```

Add your `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel dashboard.
