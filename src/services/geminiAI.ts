import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple, reliable Gemini service
class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('❌ REACT_APP_GEMINI_API_KEY not found in environment');
        return;
      }

      console.log('🔄 Initializing Gemini with key:', apiKey.substring(0, 10) + '...');
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      this.isInitialized = true;
      console.log('✅ Gemini initialized successfully');
      
    } catch (error) {
      console.error('❌ Gemini initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isInitialized || !this.model) {
        return { success: false, message: 'Gemini not initialized - check API key' };
      }

      console.log('🧪 Testing Gemini connection...');
      
      const result = await this.model.generateContent("Say 'Hello, TravelConservation!' in a friendly way.");
      const response = result.response;
      const text = response.text();
      
      console.log('✅ Connection test successful:', text);
      return { success: true, message: text };
      
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      
      let errorMessage = 'Unknown error';
      if (error.status === 403 || error.message?.includes('403')) {
        errorMessage = 'API key blocked - get new key from https://aistudio.google.com/app/apikey';
      } else if (error.status === 429 || error.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded - try again in a moment';
      } else if (error.message?.includes('API_KEY')) {
        errorMessage = 'Invalid API key - get new one from AI Studio';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Network error - check internet connection';
      }
      
      return { success: false, message: errorMessage };
    }
  }

  async generateResponse(
    systemPrompt: string, 
    userMessage: string, 
    conversationHistory: string[] = []
  ): Promise<string> {
    try {
      if (!this.isInitialized || !this.model) {
        throw new Error('Gemini service not initialized - check API key');
      }

      const context = conversationHistory.slice(-4).join('\n');
      const fullPrompt = `${systemPrompt}

CONVERSATION CONTEXT:
${context}

USER MESSAGE: ${userMessage}

Please respond as the conservation expert, staying in character:`;

      console.log('🚀 Generating response...');
      
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      
      console.log('✅ Response generated successfully');
      return text;
      
    } catch (error: any) {
      console.error('❌ Response generation failed:', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
}

// Simplified AI Manager that focuses on working solutions
class SmartAIManager {
  private geminiService: GeminiService;
  private isGeminiAvailable: boolean = false;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async initialize(): Promise<void> {
    console.log('🔄 Initializing AI services...');
    
    try {
      const geminiTest = await this.geminiService.testConnection();
      this.isGeminiAvailable = geminiTest.success;
      
      if (geminiTest.success) {
        console.log('✅ Gemini: Available');
      } else {
        console.log('❌ Gemini:', geminiTest.message);
      }
    } catch (error) {
      console.log('❌ Gemini: Failed to test');
      this.isGeminiAvailable = false;
    }

    console.log(`🎯 AI Status: Gemini ${this.isGeminiAvailable ? 'Available' : 'Unavailable'}`);
  }

  async generatePersonaResponse(
    personaPrompt: string,
    userMessage: string,
    conversationHistory: string[] = []
  ): Promise<{ response: string; provider: string }> {
    
    // Try Gemini first
    if (this.isGeminiAvailable) {
      try {
        console.log('🤖 Using Gemini...');
        const response = await this.geminiService.generateResponse(personaPrompt, userMessage, conversationHistory);
        console.log('✅ Gemini response generated successfully');
        return { response, provider: 'Gemini' };
      } catch (error) {
        console.error('❌ Gemini failed:', error);
        this.isGeminiAvailable = false; // Mark as unavailable for future requests
      }
    }

    // Fallback to intelligent static responses
    console.log('🔄 Using intelligent fallback...');
    const fallbackResponse = this.generateIntelligentFallback(personaPrompt, userMessage);
    return { response: fallbackResponse, provider: 'Fallback' };
  }

  private generateIntelligentFallback(personaPrompt: string, userMessage: string): string {
    // Extract persona name from prompt
    const personaMatch = personaPrompt.match(/You are ([^,]+)/);
    const personaName = personaMatch ? personaMatch[1] : 'your conservation expert';

    // Generate contextual response based on user message
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('marine') || lowerMessage.includes('ocean') || lowerMessage.includes('coral')) {
      return `As ${personaName}, I'd recommend exploring marine conservation opportunities in the Galápagos Islands or the Great Barrier Reef. These locations offer incredible hands-on research experiences with coral restoration and marine wildlife protection. You'd be contributing to critical conservation data while experiencing some of the world's most biodiverse marine ecosystems. What specific marine conservation challenges interest you most?`;
    }
    
    if (lowerMessage.includes('africa') || lowerMessage.includes('safari') || lowerMessage.includes('wildlife')) {
      return `${personaName} here! For impactful African conservation, I'd suggest Kenya's Maasai Mara conservancies or Namibia's community-based conservation programs. These initiatives directly support anti-poaching efforts and provide sustainable livelihoods for local communities. You'd work alongside rangers and see real results in wildlife protection. Are you interested in a particular species or conservation challenge?`;
    }
    
    if (lowerMessage.includes('luxury') || lowerMessage.includes('high-end') || lowerMessage.includes('exclusive')) {
      return `Speaking as ${personaName}, I can recommend ultra-luxury eco-lodges in Botswana's Okavango Delta or exclusive conservation concessions in Tanzania. These properties offer unparalleled luxury while funding critical wildlife corridors and community development. Think private helicopters, world-class cuisine, and exclusive access to conservation projects that are genuinely changing the landscape. What level of luxury and conservation impact are you seeking?`;
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('science') || lowerMessage.includes('study')) {
      return `As ${personaName}, I'd point you toward the research stations in Costa Rica's cloud forests or the climate research facilities in Patagonia. These programs use cutting-edge technology like satellite tracking and genetic analysis. You'd participate in real research that's pushing the boundaries of conservation science while experiencing incredible biodiversity. What type of research methodology interests you most?`;
    }

    // Default response
    return `Hello! I'm ${personaName}, and I'm excited to help you plan an amazing conservation travel experience. 

I'm currently experiencing some technical difficulties with my AI systems, but I can still provide excellent recommendations based on my expertise! 

Could you tell me more about:
- What type of conservation work interests you most?
- Your preferred travel style (adventure, luxury, research-focused)?
- Any specific regions or species you'd like to help protect?
- Your experience level with conservation activities?

I have extensive knowledge of conservation projects worldwide and can match you with the perfect experience that aligns with your interests and makes real impact. What would you like to explore first?`;
  }

  getAvailableServices(): string[] {
    const services = [];
    if (this.isGeminiAvailable) services.push('Gemini');
    services.push('Fallback'); // Always available
    return services;
  }

  isAIAvailable(): boolean {
    return this.isGeminiAvailable;
  }
}

// Export single instances
export const geminiService = new GeminiService();
export const smartAI = new SmartAIManager();
