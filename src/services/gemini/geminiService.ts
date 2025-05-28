import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ChatMessage, TripPlan } from '../../types';
import { getPersonaById } from '../../data/personas';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export interface GeminiChatRequest {
  personaId: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
  userId?: string;
}

export interface GeminiChatResponse {
  response: string;
  tripPlan?: TripPlan;
  conversationId: string;
}

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Generate a persona-based response using Gemini AI
   */
  static async generatePersonaResponse(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    try {
      const persona = getPersonaById(request.personaId);
      if (!persona) {
        throw new Error(`Persona not found: ${request.personaId}`);
      }

      // Build conversation context
      const conversationContext = this.buildConversationContext(
        persona,
        request.conversationHistory,
        request.userMessage
      );

      // Generate response
      const result = await this.model.generateContent(conversationContext);
      const response = result.response;
      const text = response.text();

      // Check if response includes trip plan generation
      const tripPlan = this.extractTripPlan(text, persona, request.userId);

      return {
        response: text,
        tripPlan,
        conversationId: this.generateConversationId(request.userId, request.personaId)
      };
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate streaming response for real-time chat
   */
  static async* generateStreamingResponse(request: GeminiChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      const persona = getPersonaById(request.personaId);
      if (!persona) {
        throw new Error(`Persona not found: ${request.personaId}`);
      }

      const conversationContext = this.buildConversationContext(
        persona,
        request.conversationHistory,
        request.userMessage
      );

      const result = await this.model.generateContentStream(conversationContext);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('Error generating streaming response:', error);
      yield 'I apologize, but I encountered an error. Please try again.';
    }
  }

  /**
   * Build conversation context with persona system prompt
   */
  private static buildConversationContext(
    persona: Persona,
    conversationHistory: ChatMessage[],
    currentMessage: string
  ): string {
    let context = `${persona.systemPrompt}\n\n`;
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      context += "Previous conversation:\n";
      conversationHistory.slice(-10).forEach(message => { // Keep last 10 messages for context
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
   * Extract trip plan from AI response if present
   */
  private static extractTripPlan(
    response: string,
    persona: Persona,
    userId?: string
  ): TripPlan | undefined {
    // Look for trip plan indicators in the response
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

    if (!hasTrip) return undefined;

    // Generate a basic trip plan structure
    // In a real implementation, this would parse the AI response more intelligently
    return {
      id: this.generateTripPlanId(),
      userId: userId || 'anonymous',
      personaId: persona.id,
      title: `${persona.name}'s Conservation Adventure`,
      description: response.substring(0, 200) + '...',
      duration: 7, // Default duration
      budget: {
        min: persona.budgetRange[0],
        max: persona.budgetRange[1],
        currency: 'USD'
      },
      destinations: [],
      activities: [],
      accommodations: [],
      conservationImpact: {
        projectsSupported: [],
        carbonOffset: 0,
        wildlifeProtected: 0,
        communityBenefit: 'Supporting local conservation initiatives'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate unique conversation ID
   */
  private static generateConversationId(userId?: string, personaId?: string): string {
    const timestamp = Date.now();
    const userPart = userId ? userId.substring(0, 8) : 'anon';
    const personaPart = personaId ? personaId.substring(0, 8) : 'default';
    return `conv_${userPart}_${personaPart}_${timestamp}`;
  }

  /**
   * Generate unique trip plan ID
   */
  private static generateTripPlanId(): string {
    return `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate API key and model availability
   */
  static async validateService(): Promise<boolean> {
    try {
      const testResult = await this.model.generateContent('Hello');
      return !!testResult.response.text();
    } catch (error) {
      console.error('Gemini service validation failed:', error);
      return false;
    }
  }
}

export default GeminiService;
