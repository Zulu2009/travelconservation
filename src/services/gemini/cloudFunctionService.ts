import { httpsCallable, getFunctions } from 'firebase/functions';
import { ChatMessage, TripPlan } from '../../types';

// Initialize Firebase Functions
const functions = getFunctions();

export interface CloudFunctionChatRequest {
  personaId: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
  userId?: string;
}

export interface CloudFunctionChatResponse {
  response: string;
  conversationId: string;
  tripPlan?: string; // Trip plan ID if generated
  timestamp: string;
}

export interface StreamingChatOptions {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: string) => void;
}

export class CloudFunctionService {
  private static generatePersonaResponseCallable = httpsCallable<CloudFunctionChatRequest, CloudFunctionChatResponse>(
    functions,
    'generatePersonaResponse'
  );

  /**
   * Generate a persona response using Cloud Functions
   */
  static async generatePersonaResponse(request: CloudFunctionChatRequest): Promise<CloudFunctionChatResponse> {
    try {
      const result = await this.generatePersonaResponseCallable(request);
      return result.data;
    } catch (error) {
      console.error('Error calling Cloud Function:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate streaming response using Server-Sent Events
   */
  static async generateStreamingResponse(
    request: CloudFunctionChatRequest,
    options: StreamingChatOptions
  ): Promise<void> {
    try {
      // Get the Cloud Function URL (you'll need to replace this with your actual function URL)
      const functionUrl = `${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}/streamPersonaResponse`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                options.onError(data.error);
                return;
              }
              
              if (data.chunk) {
                fullResponse += data.chunk;
                options.onChunk(data.chunk);
              }
              
              if (data.complete) {
                options.onComplete(data.fullResponse || fullResponse);
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming response:', error);
      options.onError('Failed to generate streaming response');
    }
  }

  /**
   * Validate that Cloud Functions are available
   */
  static async validateService(): Promise<boolean> {
    try {
      // Test with a simple request
      const testRequest: CloudFunctionChatRequest = {
        personaId: 'marine-biologist',
        userMessage: 'Hello',
        conversationHistory: []
      };
      
      await this.generatePersonaResponse(testRequest);
      return true;
    } catch (error) {
      console.error('Cloud Function service validation failed:', error);
      return false;
    }
  }

  /**
   * Get conversation history from Firestore
   */
  static async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    // This would integrate with Firestore to retrieve conversation history
    // For now, return empty array
    return [];
  }

  /**
   * Save conversation to Firestore
   */
  static async saveConversation(
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    // This would integrate with Firestore to save the conversation
    // Implementation would depend on your Firestore structure
    console.log('Saving conversation:', conversationId, message);
  }

  /**
   * Get trip plan by ID
   */
  static async getTripPlan(tripPlanId: string): Promise<TripPlan | null> {
    // This would integrate with Firestore to retrieve trip plans
    // For now, return null
    return null;
  }
}

export default CloudFunctionService;
