import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyticsEngine, AnalyticsInput, SupplierMetrics } from './analyticsEngine';

// Import agentic system modules
import { 
  discoverOperators, 
  monitorDiscoverySources, 
  getProcessingStatus 
} from './discoveryAgent';
import { 
  createScrapingTask, 
  updateTaskStatus, 
  getQueueStats, 
  retryFailedTasks 
} from './taskManager';
import { 
  analyzeOperator, 
  batchAnalyzeOperators 
} from './analysisAgent';

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

// TEST FUNCTIONS - Import and export test functions
export { 
  testDatabaseConnection, 
  testDiscovery, 
  getDatabaseStats 
} from './testConnection';

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

// SYSTEM 3 - ANALYTICS ENGINE FUNCTIONS
// Pure JavaScript calculations, no LLM usage

/**
 * Triggered when supplier data is created or updated
 * Automatically calculates metrics using analytics engine
 */
export const calculateSupplierMetrics = functions.firestore
  .document('suppliers/{supplierId}')
  .onWrite(async (change, context) => {
    const supplierId = context.params.supplierId;
    const supplierData = change.after.data();
    
    if (!supplierData) {
      console.log(`Supplier ${supplierId} deleted, skipping metrics calculation`);
      return;
    }

    try {
      console.log(`Calculating metrics for supplier: ${supplierId}`);
      
      // Transform Firestore data to AnalyticsInput format
      const analyticsInput: AnalyticsInput = {
        supplierId,
        reviews: supplierData.reviews || {
          averageRating: 0,
          totalReviews: 0,
          recentReviews: []
        },
        certifications: supplierData.certifications || [],
        conservationImpact: supplierData.conservationImpact || {
          projectsSupported: 0,
          fundsRaised: 0,
          speciesProtected: [],
          communityBenefits: ""
        },
        financials: supplierData.financials || {
          annualRevenue: 1000000, // Default 1M
          conservationSpending: 0,
          communitySpending: 0,
          researchSpending: 0
        },
        operations: supplierData.operations || {
          yearsInOperation: 1,
          capacity: 20,
          occupancyRate: 0.7,
          localStaffPercentage: 50
        },
        verification: supplierData.verification || {
          lastAuditDate: new Date().toISOString(),
          auditScore: 85,
          complianceIssues: 0
        }
      };

      // Calculate metrics using analytics engine
      const metrics = analyticsEngine.calculateSupplierMetrics(analyticsInput);
      
      // Store calculated metrics
      await admin.firestore().collection('supplier-metrics').doc(supplierId).set({
        ...metrics,
        calculatedAt: new Date().toISOString(),
        version: '1.0'
      });

      // Update supplier document with key metrics
      await admin.firestore().collection('suppliers').doc(supplierId).update({
        'metrics.trustScore': metrics.trustScore,
        'metrics.sustainabilityRating': metrics.sustainabilityRating,
        'metrics.overallScore': metrics.overallScore,
        'metrics.riskLevel': metrics.riskLevel,
        'metrics.lastCalculated': new Date().toISOString()
      });

      console.log(`✅ Metrics calculated for ${supplierId}:`, {
        trustScore: metrics.trustScore,
        sustainabilityRating: metrics.sustainabilityRating,
        overallScore: metrics.overallScore,
        riskLevel: metrics.riskLevel
      });

    } catch (error) {
      console.error(`❌ Error calculating metrics for ${supplierId}:`, error);
    }
  });

/**
 * Batch calculate metrics for all suppliers
 * Triggered via HTTP request for admin operations
 */
export const batchCalculateMetrics = functions.https.onRequest(async (request, response) => {
  try {
    console.log('🔄 Starting batch metrics calculation...');
    
    const suppliersSnapshot = await admin.firestore().collection('suppliers').get();
    const suppliers = suppliersSnapshot.docs;
    
    console.log(`Found ${suppliers.length} suppliers to process`);

    let processed = 0;
    let errors = 0;
    
    for (const supplierDoc of suppliers) {
      try {
        const supplierId = supplierDoc.id;
        const supplierData = supplierDoc.data();
        
        // Transform to AnalyticsInput
        const analyticsInput: AnalyticsInput = {
          supplierId,
          reviews: supplierData.reviews || { averageRating: 0, totalReviews: 0, recentReviews: [] },
          certifications: supplierData.certifications || [],
          conservationImpact: supplierData.conservationImpact || {
            projectsSupported: 0,
            fundsRaised: 0,
            speciesProtected: [],
            communityBenefits: ""
          },
          financials: supplierData.financials || {
            annualRevenue: 1000000,
            conservationSpending: 0,
            communitySpending: 0,
            researchSpending: 0
          },
          operations: supplierData.operations || {
            yearsInOperation: 1,
            capacity: 20,
            occupancyRate: 0.7,
            localStaffPercentage: 50
          },
          verification: supplierData.verification || {
            lastAuditDate: new Date().toISOString(),
            auditScore: 85,
            complianceIssues: 0
          }
        };

        // Calculate metrics
        const metrics = analyticsEngine.calculateSupplierMetrics(analyticsInput);
        
        // Store metrics
        await admin.firestore().collection('supplier-metrics').doc(supplierId).set({
          ...metrics,
          calculatedAt: new Date().toISOString(),
          version: '1.0'
        });

        // Update supplier with key metrics
        await admin.firestore().collection('suppliers').doc(supplierId).update({
          'metrics.trustScore': metrics.trustScore,
          'metrics.sustainabilityRating': metrics.sustainabilityRating,
          'metrics.overallScore': metrics.overallScore,
          'metrics.riskLevel': metrics.riskLevel,
          'metrics.lastCalculated': new Date().toISOString()
        });

        processed++;
        console.log(`✅ Processed ${supplierId}: Trust ${metrics.trustScore}, Overall ${metrics.overallScore}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Error processing supplier:`, error);
      }
    }
    
    console.log(`🎉 Batch calculation complete: ${processed} processed, ${errors} errors`);
    
    response.json({
      success: true,
      processed,
      errors,
      message: `Batch calculation complete: ${processed} suppliers processed`
    });
    
  } catch (error) {
    console.error('❌ Batch calculation failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AGENTIC VETTING SYSTEM EXPORTS
// Export all agentic system functions

// Discovery Agent Functions
export { 
  discoverOperators, 
  monitorDiscoverySources, 
  getProcessingStatus 
};

// Task Manager Functions
export { 
  createScrapingTask, 
  updateTaskStatus, 
  getQueueStats, 
  retryFailedTasks 
};

// Analysis Agent Functions
export { 
  analyzeOperator, 
  batchAnalyzeOperators 
};

// Smart Researcher Function
export { smartResearcher } from './smartResearcher';

// Database Import Function
export { importOperators } from './importOperators';

// Vetting Summary Function
export const generateVettingSummary = functions.https.onRequest(async (request, response) => {
  try {
    const { start_time, operators_discovered, tasks_created } = request.body;
    
    // Get processing statistics
    const queueStatsResponse = await fetch(`https://us-central1-${process.env.GOOGLE_CLOUD_PROJECT}.cloudfunctions.net/getQueueStats`);
    const queueStats = await queueStatsResponse.json();
    
    // Get analysis summary
    const analysisResponse = await fetch(`https://us-central1-${process.env.GOOGLE_CLOUD_PROJECT}.cloudfunctions.net/getAnalyticsSummary`);
    const analysisData = await analysisResponse.json();
    
    const endTime = new Date();
    const startTime = new Date(start_time);
    const processingDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes
    
    const summary = {
      vetting_session: {
        start_time: start_time,
        end_time: endTime.toISOString(),
        duration_minutes: processingDuration
      },
      discovery_results: {
        operators_discovered: operators_discovered || 0,
        tasks_created: tasks_created || 0
      },
      processing_stats: queueStats.success ? queueStats.stats : { error: 'Failed to fetch queue stats' },
      analysis_summary: analysisData.success ? analysisData.summary : { error: 'Failed to fetch analysis summary' },
      recommendations: generateRecommendations(operators_discovered, tasks_created, processingDuration)
    };
    
    // Store summary in Firestore
    await admin.firestore().collection('vetting-summaries').add({
      ...summary,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    response.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('❌ Error generating vetting summary:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function generateRecommendations(discovered: number, tasksCreated: number, duration: number): string[] {
  const recommendations = [];
  
  if (discovered === 0) {
    recommendations.push('Consider expanding discovery sources or adjusting search criteria');
  } else if (discovered > 100) {
    recommendations.push('High discovery volume - consider implementing additional filtering');
  }
  
  if (duration > 60) {
    recommendations.push('Processing took longer than expected - consider optimizing queue settings');
  }
  
  if (tasksCreated < discovered * 0.8) {
    recommendations.push('Some operators may have been filtered out - review discovery criteria');
  }
  
  recommendations.push('Review analysis results and update operator verification status');
  recommendations.push('Consider scheduling next vetting run based on discovery volume');
  
  return recommendations;
}

/**
 * Get supplier analytics summary
 * Returns aggregated metrics and insights
 */
export const getAnalyticsSummary = functions.https.onRequest(async (request, response) => {
  try {
    const metricsSnapshot = await admin.firestore().collection('supplier-metrics').get();
    const metrics = metricsSnapshot.docs.map(doc => doc.data() as SupplierMetrics);
    
    if (metrics.length === 0) {
      response.json({
        success: true,
        summary: {
          totalSuppliers: 0,
          message: 'No supplier metrics found'
        }
      });
      return;
    }
    
    // Calculate aggregate statistics
    const summary = {
      totalSuppliers: metrics.length,
      averageTrustScore: Math.round((metrics.reduce((sum, m) => sum + m.trustScore, 0) / metrics.length) * 10) / 10,
      averageSustainabilityRating: Math.round((metrics.reduce((sum, m) => sum + m.sustainabilityRating, 0) / metrics.length) * 10) / 10,
      averageOverallScore: Math.round((metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length) * 10) / 10,
      riskDistribution: {
        low: metrics.filter(m => m.riskLevel === 'low').length,
        medium: metrics.filter(m => m.riskLevel === 'medium').length,
        high: metrics.filter(m => m.riskLevel === 'high').length
      },
      topPerformers: metrics
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 5)
        .map(m => ({
          trustScore: m.trustScore,
          sustainabilityRating: m.sustainabilityRating,
          overallScore: m.overallScore,
          riskLevel: m.riskLevel
        })),
      lastUpdated: new Date().toISOString()
    };
    
    response.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('❌ Analytics summary failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
