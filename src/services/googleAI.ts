import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Gemini AI Debug] ${message}`, data || '');
  }
};

// Get API key with validation
const getApiKey = (): string => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  debugLog('API Key check:', apiKey ? `Key present (${apiKey.substring(0, 10)}...)` : 'No API key found');
  
  if (!apiKey) {
    throw new Error('REACT_APP_GEMINI_API_KEY is not set in environment variables');
  }
  
  return apiKey;
};

// Initialize Google AI with error handling
let genAI: GoogleGenerativeAI;
let geminiModel: any;

try {
  const apiKey = getApiKey();
  genAI = new GoogleGenerativeAI(apiKey);
  
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  geminiModel = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    safetySettings
  });
  
  debugLog('Gemini AI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
  geminiModel = null;
}

// Test API connection
export const testGeminiConnection = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  try {
    debugLog('Testing Gemini API connection...');
    
    if (!geminiModel) {
      throw new Error('Gemini model not initialized - check API key');
    }

    const result = await geminiModel.generateContent('Hello, please respond with "API connection successful"');
    const response = result.response;
    
    // Check for blocked responses
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Response blocked: ${response.promptFeedback.blockReason}`);
    }
    
    const text = response.text();
    debugLog('Test response received:', text);
    
    return { 
      success: true 
    };
  } catch (error: any) {
    debugLog('API test failed:', error);
    
    // Provide more detailed error information
    let errorMessage = error.message || 'Unknown error';
    
    // Check for specific error types
    if (error.status === 400) {
      errorMessage = 'Invalid API request - check API key format';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - API key is invalid or missing';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden - API key lacks permissions or quota exceeded';
    } else if (error.status === 404) {
      errorMessage = 'API endpoint not found - check Gemini API is enabled';
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Network error - check internet connection';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: {
        status: error.status,
        statusText: error.statusText,
        originalMessage: error.message
      }
    };
  }
};

// Generate AI response with comprehensive error handling
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    debugLog('Generating AI response for prompt:', prompt.substring(0, 100) + '...');
    
    // Check if model is initialized
    if (!geminiModel) {
      throw new Error('Gemini model not initialized. Check your API key.');
    }

    // Generate content
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    
    // Check if response was blocked
    if (response.promptFeedback?.blockReason) {
      debugLog('Response blocked:', response.promptFeedback.blockReason);
      throw new Error(`Response blocked: ${response.promptFeedback.blockReason}`);
    }

    const text = response.text();
    debugLog('AI response generated successfully:', text.substring(0, 100) + '...');
    
    return text;
  } catch (error: any) {
    debugLog('Error generating AI response:', error);
    
    // Provide specific error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API key. Please check your Gemini API key.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('API quota exceeded. Please check your Gemini API usage.');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Permission denied. Please check your API key permissions.');
    } else {
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
  }
};

// Export the model for direct use
export { geminiModel };

// Export debug utilities
export const debugGeminiSetup = () => {
  console.log('=== Gemini AI Debug Info ===');
  console.log('API Key:', process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing');
  console.log('Model initialized:', !!geminiModel);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('============================');
};
