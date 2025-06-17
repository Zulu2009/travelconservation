import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon, BugReport as BugIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse, debugGeminiSetup } from '../../services/googleAI';
import { Persona } from '../../data/personas';

interface ChatMessage {
  id: string;
  type: 'user' | 'persona';
  content: string;
  timestamp: Date;
  isAI?: boolean;
  error?: boolean;
}

interface PersonaChatProps {
  selectedPersona: Persona;
  onTripRecommendation?: (recommendation: any) => void;
}

const PersonaChat: React.FC<PersonaChatProps> = ({ selectedPersona, onTripRecommendation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [lastError, setLastError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize conversation with persona greeting
    const greetingMessage: ChatMessage = {
      id: uuidv4(),
      type: 'persona',
      content: selectedPersona.greeting,
      timestamp: new Date(),
      isAI: false
    };
    setMessages([greetingMessage]);
    setConversationContext([selectedPersona.systemPrompt]);
    
    // Debug setup
    if (process.env.NODE_ENV === 'development') {
      console.log('[PersonaChat] Initialized with persona:', selectedPersona.name);
      debugGeminiSetup();
    }
  }, [selectedPersona]);

  const generatePersonaResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log('[PersonaChat] Generating AI response for:', userMessage.substring(0, 50) + '...');
      
      const contextPrompt = `
${selectedPersona.systemPrompt}

CONVERSATION CONTEXT:
${conversationContext.slice(-5).join('\n')}

CURRENT USER MESSAGE: "${userMessage}"

INSTRUCTIONS:
- Respond as ${selectedPersona.name} staying completely in character
- Provide specific, actionable conservation travel recommendations
- Include real conservation benefits and impact data when possible
- Ask follow-up questions to better understand their interests
- Keep responses engaging but focused (200-400 words)
- If recommending specific locations, include why they match the user's interests
- Always connect recommendations back to meaningful conservation impact

Your response:`;

      const aiResponse = await generateAIResponse(contextPrompt);
      console.log('[PersonaChat] AI response received:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
      
    } catch (error: any) {
      console.error('[PersonaChat] AI generation failed:', error);
      setLastError(error.message);
      
      // Fallback responses based on persona
      const fallbackResponses = {
        'marine-biologist': `That's fascinating! As a marine biologist, I'd recommend looking into the Galápagos Marine Reserve or the Great Barrier Reef Marine Park. Both offer incredible opportunities to participate in coral restoration and sea turtle monitoring programs. The research stations there welcome volunteers, and you'd be contributing to critical conservation data while experiencing some of the world's most biodiverse marine ecosystems. What specific marine species or conservation challenges interest you most?`,
        
        'green-beret': `Roger that! For high-impact conservation operations, I'd recommend the anti-poaching units in Kenya's Maasai Mara or Namibia's conservancies. These programs need direct support - you'd be working alongside rangers, learning tactical conservation methods, and seeing real results in wildlife protection. The community partnerships there are incredible, and every dollar goes directly to ranger salaries and equipment. Are you prepared for challenging conditions in remote locations?`,
        
        'luxury-curator': `Darling, I have the perfect recommendation! Consider the ultra-luxury eco-lodges in Botswana's Okavango Delta or the exclusive conservation concessions in Tanzania. These properties offer unparalleled luxury while funding critical wildlife corridors and community development. Think private helicopters, world-class cuisine, and exclusive access to conservation projects that are genuinely changing the landscape. What level of luxury and exclusivity are you seeking?`,
        
        'wildlife-documentarian': `What an exciting opportunity! I'd suggest the wildlife corridors of Costa Rica or the cloud forests of Ecuador. These locations offer incredible storytelling opportunities - you'll witness conservation success stories firsthand and meet the local heroes protecting these ecosystems. The biodiversity is extraordinary, and the conservation programs have documented, measurable impacts. Are you interested in a particular type of ecosystem or conservation story?`,
        
        'adventure-scientist': `Excellent! For cutting-edge conservation science, consider the climate research stations in Patagonia or the high-altitude ecosystem studies in the Himalayas. These programs use innovative technology like satellite tracking, drone monitoring, and genetic analysis. You'd be participating in real research that's pushing the boundaries of conservation science. The adventure factor is high, and the scientific impact is profound. What type of extreme environment or research methodology interests you most?`
      };
      
      const fallback = fallbackResponses[selectedPersona.id as keyof typeof fallbackResponses] || 
        `I apologize, but I'm having trouble connecting to my AI systems right now. However, I'm excited to help you plan an amazing conservation experience! Could you tell me more about what type of conservation work interests you most? I can provide recommendations based on my expertise in ${selectedPersona.characteristics.focusAreas.join(', ')}.`;
      
      console.log('[PersonaChat] Using fallback response');
      return fallback;
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    setIsLoading(true);
    setLastError('');

    // Add to conversation context
    setConversationContext(prev => [...prev, `User: ${currentMessage}`]);

    try {
      const personaResponse = await generatePersonaResponse(currentMessage);
      
      const personaMsg: ChatMessage = {
        id: uuidv4(),
        type: 'persona',
        content: personaResponse,
        timestamp: new Date(),
        isAI: !lastError // Mark as AI if no error occurred
      };

      setMessages(prev => [...prev, personaMsg]);
      setConversationContext(prev => [...prev, `${selectedPersona.name}: ${personaResponse}`]);
    } catch (error: any) {
      console.error('Error in chat:', error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        type: 'persona',
        content: `I apologize, but I'm experiencing technical difficulties. Please try again in a moment.`,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    const greetingMessage: ChatMessage = {
      id: uuidv4(),
      type: 'persona',
      content: selectedPersona.greeting,
      timestamp: new Date(),
      isAI: false
    };
    setMessages([greetingMessage]);
    setConversationContext([selectedPersona.systemPrompt]);
    setLastError('');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Debug Info */}
      {debugMode && (
        <Alert severity="info" sx={{ mb: 1 }}>
          <Typography variant="caption">
            Debug Mode: API Key {process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing'} | 
            Last Error: {lastError || 'None'}
          </Typography>
        </Alert>
      )}

      {/* Persona Info Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
            {selectedPersona.emoji}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{selectedPersona.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedPersona.title}
            </Typography>
          </Box>
          <IconButton onClick={resetConversation} title="Start New Conversation">
            <RefreshIcon />
          </IconButton>
          {process.env.NODE_ENV === 'development' && (
            <IconButton 
              onClick={() => setDebugMode(!debugMode)} 
              title="Toggle Debug Mode"
              color={debugMode ? 'primary' : 'default'}
            >
              <BugIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Quick questions to get started:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedPersona.sampleQuestions.map((question, index) => (
              <Chip 
                key={index}
                label={question}
                variant="outlined"
                size="small"
                clickable
                onClick={() => handleQuickQuestion(question)}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Card
              sx={{
                maxWidth: '70%',
                bgcolor: message.type === 'user' 
                  ? 'primary.main' 
                  : message.error 
                    ? 'error.light' 
                    : 'grey.100',
                color: message.type === 'user' ? 'white' : 'text.primary'
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {message.type === 'persona' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {selectedPersona.name}
                      {message.isAI && (
                        <Chip 
                          label="AI" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
                      )}
                      {message.error && (
                        <Chip 
                          label="Error" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
                      )}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    opacity: 0.8,
                    textAlign: message.type === 'user' ? 'right' : 'left'
                  }}
                >
                  {format(message.timestamp, 'HH:mm')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Card sx={{ bgcolor: 'grey.100' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {selectedPersona.name} is thinking...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${selectedPersona.name} about conservation travel...`}
            variant="outlined"
            size="small"
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            sx={{ 
              minWidth: 'auto', 
              px: 2,
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonaChat;
