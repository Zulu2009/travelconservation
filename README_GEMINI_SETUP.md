# Google Gemini AI Integration Setup Guide

This guide will help you set up Google Gemini AI integration for the TravelConservation.com persona chat system.

## Prerequisites

1. **Google Cloud Project** with Gemini API access
2. **Firebase Project** (travelconservation-b4f04)
3. **Node.js 18+** for Firebase Functions

## Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for your project
3. Copy the API key for later use

## Step 2: Configure Environment Variables

### Frontend (.env)
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update `.env` with:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=travelconservation-b4f04.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=travelconservation-b4f04
REACT_APP_FIREBASE_STORAGE_BUCKET=travelconservation-b4f04.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id

# Google Gemini AI Configuration
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key

# Firebase Functions URL (for production)
REACT_APP_FIREBASE_FUNCTIONS_URL=https://us-central1-travelconservation-b4f04.cloudfunctions.net
```

### Firebase Functions Configuration
Set the Gemini API key for Firebase Functions:

```bash
cd functions
firebase functions:config:set gemini.api_key="your_actual_gemini_api_key"
```

## Step 3: Install Dependencies

### Frontend Dependencies
```bash
npm install @google/generative-ai
```

### Functions Dependencies
```bash
cd functions
npm install
```

## Step 4: Build and Deploy Functions

### Build Functions
```bash
cd functions
npm run build
```

### Deploy Functions
```bash
firebase deploy --only functions
```

## Step 5: Test the Integration

1. Start the development server:
```bash
npm start
```

2. Navigate to `/persona-planner`
3. Select a persona (e.g., Dr. Marina Reef)
4. Start chatting to test the AI integration

## Features Implemented

### 🤖 AI Persona System
- **6 Unique AI Personalities** with distinct communication styles
- **Context-Aware Conversations** that remember chat history
- **Streaming Responses** for real-time chat experience
- **Fallback Handling** if streaming fails

### 🔒 Security & Rate Limiting
- **Rate Limiting**: 10 requests per minute per user
- **Authentication Integration** with Firebase Auth
- **Error Handling** with graceful fallbacks

### 💾 Data Persistence
- **Conversation Storage** in Firestore
- **Trip Plan Generation** and storage
- **User Context** preservation across sessions

### 🎭 Persona Personalities

1. **🐠 Dr. Marina Reef** - Marine Conservation Biologist
   - Focus: Ocean conservation, coral reefs, sustainable diving
   - Style: Scientific but accessible, uses marine metaphors

2. **📸 Alex Wildframe** - Wildlife Conservation Photographer
   - Focus: Ethical wildlife viewing, photography, endangered species
   - Style: Visual storytelling, patient, respectful of animals

3. **👑 Isabella Sterling** - Luxury Conservation Curator
   - Focus: Ultra-luxury eco-experiences, exclusive access
   - Style: Sophisticated, emphasizes prestige and impact

4. **🛡️ Captain Jake Rivers** - Conservation Security Specialist
   - Focus: Anti-poaching, wildlife protection, adventure travel
   - Style: Direct, military precision, action-oriented

5. **🌿 Aiyana Earthsong** - Indigenous Conservation Guide
   - Focus: Traditional knowledge, community-based conservation
   - Style: Wise, spiritual, emphasizes cultural connections

6. **🌡️ Dr. Storm Weatherby** - Climate Change Research Scientist
   - Focus: Climate-conscious travel, carbon neutrality
   - Style: Data-driven, urgent about climate action

## Cloud Functions

### `generatePersonaResponse`
- **Type**: Callable Function
- **Purpose**: Generate AI responses with conversation context
- **Features**: Rate limiting, trip plan detection, Firestore integration

### `streamPersonaResponse`
- **Type**: HTTP Function
- **Purpose**: Provide streaming responses via Server-Sent Events
- **Features**: Real-time streaming, error handling, CORS support

## Firestore Collections

### `conversations`
```typescript
{
  userId: string;
  personaId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: Timestamp;
}
```

### `tripPlans`
```typescript
{
  id: string;
  userId: string;
  personaId: string;
  title: string;
  description: string;
  fullResponse: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `rateLimits`
```typescript
{
  windowStart: number;
  requests: number;
}
```

## Troubleshooting

### Common Issues

1. **"Failed to generate AI response"**
   - Check Gemini API key is correctly set
   - Verify Firebase Functions configuration
   - Check rate limits

2. **Streaming not working**
   - Verify CORS settings in Cloud Functions
   - Check network connectivity
   - Falls back to non-streaming automatically

3. **Functions deployment fails**
   - Ensure Node.js 18+ is installed
   - Check Firebase project permissions
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check Functions configuration
firebase functions:config:get

# View Functions logs
firebase functions:log

# Test Functions locally
cd functions && npm run serve

# Check Firestore rules
firebase firestore:rules:get
```

## Production Deployment

1. **Set production environment variables**
2. **Deploy Functions**: `firebase deploy --only functions`
3. **Update CORS settings** for your domain
4. **Monitor usage** and adjust rate limits as needed

## Cost Considerations

- **Gemini API**: Pay per request/token
- **Firebase Functions**: Pay per invocation and compute time
- **Firestore**: Pay per read/write operation
- **Consider implementing caching** for frequently asked questions

## Next Steps

1. **Add conversation caching** to reduce API calls
2. **Implement trip plan parsing** from AI responses
3. **Add voice input/output** capabilities
4. **Create admin dashboard** for monitoring usage
5. **Add conversation analytics** and insights

## Support

For issues with this integration:
1. Check the troubleshooting section above
2. Review Firebase Functions logs
3. Test with the local emulator first
4. Verify all environment variables are set correctly
