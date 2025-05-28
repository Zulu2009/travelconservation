import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

interface PersonaChatRequest {
  personaId: string;
  userMessage: string;
  conversationHistory: any[];
  userId?: string;
}

interface Persona {
  id: string;
  name: string;
  title: string;
  systemPrompt: string;
  backgroundColor: string;
  budgetRange: [number, number];
}

// Persona data (in production, this would come from Firestore)
const PERSONAS: Record<string, Persona> = {
  'marine-biologist': {
    id: 'marine-biologist',
    name: 'Dr. Marina Reef',
    title: 'Marine Conservation Biologist',
    backgroundColor: '#006994',
    budgetRange: [3000, 15000],
    systemPrompt: `You are Dr. Marina Reef, a marine conservation biologist with 15 years of experience. You're passionate about ocean conservation and specialize in creating transformative marine experiences. 

Your communication style:
- Use marine metaphors and ocean analogies
- Share fascinating marine biology facts
- Emphasize the interconnectedness of marine ecosystems
- Be enthusiastic but scientifically accurate
- Focus on sustainable diving and snorkeling experiences
- Highlight coral restoration projects and marine protected areas

When planning trips:
- Prioritize destinations with active marine conservation projects
- Recommend sustainable diving operators and marine research stations
- Include opportunities to participate in coral restoration or marine research
- Suggest accommodations that support marine conservation
- Focus on educational experiences about marine ecosystems
- Consider tidal patterns, marine life migration, and seasonal factors

Always emphasize how travelers can contribute to marine conservation while having incredible underwater experiences.`
  },
  'wildlife-photographer': {
    id: 'wildlife-photographer',
    name: 'Alex Wildframe',
    title: 'Wildlife Conservation Photographer',
    backgroundColor: '#8B4513',
    budgetRange: [4000, 20000],
    systemPrompt: `You are Alex Wildframe, an award-winning wildlife conservation photographer with experience documenting endangered species across 6 continents. You're passionate about ethical wildlife viewing and conservation storytelling.

Your communication style:
- Think and speak in visual terms
- Share stories about specific wildlife encounters
- Emphasize patience and respect for animals
- Use photography metaphors (framing, lighting, composition)
- Focus on the story behind each species and conservation efforts
- Highlight the importance of ethical wildlife viewing

When planning trips:
- Prioritize destinations with active wildlife conservation projects
- Recommend ethical wildlife viewing opportunities
- Include photography workshops and guided wildlife experiences
- Suggest accommodations that support local conservation efforts
- Focus on seasonal wildlife migrations and breeding patterns
- Consider optimal lighting conditions and weather for wildlife viewing
- Emphasize small group sizes to minimize wildlife disturbance

Always stress the importance of leaving no trace and contributing to wildlife conservation through responsible tourism.`
  },
  'luxury-curator': {
    id: 'luxury-curator',
    name: 'Isabella Sterling',
    title: 'Luxury Conservation Curator',
    backgroundColor: '#1B4332',
    budgetRange: [10000, 50000],
    systemPrompt: `You are Isabella Sterling, a luxury conservation curator and former luxury hotel executive. You specialize in creating ultra-luxury eco-experiences that fund major conservation initiatives.

Your communication style:
- Use sophisticated and elegant language
- Emphasize exclusivity and uniqueness
- Highlight the luxury amenities and services
- Connect luxury experiences to meaningful conservation impact
- Use terms like "curated," "bespoke," "exclusive," and "transformative"
- Focus on the prestige and social impact of conservation travel

When planning trips:
- Prioritize ultra-luxury eco-lodges and conservation resorts
- Recommend exclusive experiences with limited access
- Include private guides, personal chefs, and premium amenities
- Suggest accommodations with the highest sustainability ratings
- Focus on destinations where luxury tourism directly funds conservation
- Consider helicopter transfers, private jets, and exclusive access
- Emphasize the social impact and prestige of conservation travel

Always highlight how luxury travelers can make the greatest conservation impact while enjoying unparalleled comfort and exclusivity.`
  }
};

/**
 * Cloud Function for generating persona-based chat responses
 */
export const generatePersonaResponse = functions.https.onCall(async (data: PersonaChatRequest, context) => {
  try {
    // Validate request
    if (!data.personaId || !data.userMessage) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Rate limiting check
    if (context.auth) {
      const userId = context.auth.uid;
      const rateLimitResult = await checkRateLimit(userId);
      if (!rateLimitResult.allowed) {
        throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
      }
    }

    // Get persona
    const persona = PERSONAS[data.personaId];
    if (!persona) {
      throw new functions.https.HttpsError('not-found', 'Persona not found');
    }

    // Build conversation context
    const conversationContext = buildConversationContext(
      persona,
      data.conversationHistory || [],
      data.userMessage
    );

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(conversationContext);
    const response = result.response.text();

    // Save conversation to Firestore
    const conversationId = await saveConversation({
      userId: data.userId || context.auth?.uid || 'anonymous',
      personaId: data.personaId,
      userMessage: data.userMessage,
      aiResponse: response,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Check if response indicates trip plan generation
    const tripPlan = extractTripPlan(response, persona, data.userId);
    if (tripPlan) {
      await saveTripPlan(tripPlan);
    }

    return {
      response,
      conversationId,
      tripPlan: tripPlan ? tripPlan.id : null,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating persona response:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate response');
  }
});

/**
 * Cloud Function for streaming persona responses
 */
export const streamPersonaResponse = functions.https.onRequest(async (req, res) => {
  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  try {
    const { personaId, userMessage, conversationHistory } = req.body;

    if (!personaId || !userMessage) {
      res.write(`data: ${JSON.stringify({ error: 'Missing required fields' })}\n\n`);
      res.end();
      return;
    }

    const persona = PERSONAS[personaId];
    if (!persona) {
      res.write(`data: ${JSON.stringify({ error: 'Persona not found' })}\n\n`);
      res.end();
      return;
    }

    const conversationContext = buildConversationContext(
      persona,
      conversationHistory || [],
      userMessage
    );

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContentStream(conversationContext);

    let fullResponse = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ complete: true, fullResponse })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error streaming response:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
});

/**
 * Build conversation context with persona system prompt
 */
function buildConversationContext(
  persona: Persona,
  conversationHistory: any[],
  currentMessage: string
): string {
  let context = `${persona.systemPrompt}\n\n`;
  
  // Add conversation history
  if (conversationHistory.length > 0) {
    context += "Previous conversation:\n";
    conversationHistory.slice(-10).forEach(message => {
      const sender = message.sender === 'user' ? 'Traveler' : persona.name;
      context += `${sender}: ${message.content}\n`;
    });
    context += "\n";
  }

  // Add current message
  context += `Traveler: ${currentMessage}\n\n`;
  
  // Add response instructions
  context += `Please respond as ${persona.name}, staying completely in character. `;
  context += `Be helpful, engaging, and provide specific conservation travel recommendations. `;
  context += `If the traveler seems ready for a detailed trip plan, offer to create one. `;
  context += `Include specific destinations, activities, and conservation projects when relevant.\n\n`;
  context += `${persona.name}:`;

  return context;
}

/**
 * Rate limiting check
 */
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // 10 requests per minute

  const rateLimitRef = admin.firestore().collection('rateLimits').doc(userId);
  
  return admin.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(rateLimitRef);
    const data = doc.data();
    
    if (!data || now - data.windowStart > windowMs) {
      // New window
      transaction.set(rateLimitRef, {
        windowStart: now,
        requests: 1
      });
      return { allowed: true, remaining: maxRequests - 1 };
    } else if (data.requests >= maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0 };
    } else {
      // Increment counter
      transaction.update(rateLimitRef, {
        requests: data.requests + 1
      });
      return { allowed: true, remaining: maxRequests - data.requests - 1 };
    }
  });
}

/**
 * Save conversation to Firestore
 */
async function saveConversation(conversation: any): Promise<string> {
  const conversationRef = await admin.firestore().collection('conversations').add(conversation);
  return conversationRef.id;
}

/**
 * Extract trip plan from AI response
 */
function extractTripPlan(response: string, persona: Persona, userId?: string): any | null {
  const tripPlanKeywords = [
    'trip plan',
    'itinerary',
    'detailed plan',
    'travel plan',
    'conservation journey'
  ];

  const hasTrip = tripPlanKeywords.some(keyword => 
    response.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!hasTrip) return null;

  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId: userId || 'anonymous',
    personaId: persona.id,
    title: `${persona.name}'s Conservation Adventure`,
    description: response.substring(0, 200) + '...',
    fullResponse: response,
    budget: {
      min: persona.budgetRange[0],
      max: persona.budgetRange[1],
      currency: 'USD'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

/**
 * Save trip plan to Firestore
 */
async function saveTripPlan(tripPlan: any): Promise<string> {
  const tripPlanRef = await admin.firestore().collection('tripPlans').add(tripPlan);
  return tripPlanRef.id;
}
