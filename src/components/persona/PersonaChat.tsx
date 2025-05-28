import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Button,
  Fade,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Mic as MicIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Persona, ChatMessage } from '../../types';
import { getPersonaById } from '../../data/personas';
import CloudFunctionService, { CloudFunctionChatRequest } from '../../services/gemini/cloudFunctionService';
import { useAuth } from '../../hooks/useAuth';

interface PersonaChatProps {
  personaId: string;
  onTripPlanGenerated?: (tripPlan: any) => void;
  initialMessage?: string;
}

const PersonaChat: React.FC<PersonaChatProps> = ({
  personaId,
  onTripPlanGenerated,
  initialMessage
}) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const persona = getPersonaById(personaId);

  useEffect(() => {
    if (persona && messages.length === 0) {
      // Add initial greeting message
      const greeting = getPersonaGreeting(persona);
      setMessages([{
        id: '1',
        content: greeting,
        sender: 'persona',
        timestamp: new Date(),
        personaId: persona.id
      }]);
    }
  }, [persona, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPersonaGreeting = (persona: Persona): string => {
    const greetings = {
      'marine-biologist': `🌊 Hello! I'm Dr. Marina Reef, and I'm absolutely thrilled to help you discover the wonders of our oceans! Whether you're dreaming of swimming alongside whale sharks, exploring vibrant coral reefs, or contributing to marine conservation research, I'll help you plan an unforgettable underwater adventure. What kind of marine experience calls to your soul?`,
      'wildlife-photographer': `📸 Hey there! Alex Wildframe here, and I can already picture the incredible wildlife encounters we're going to plan for you! I've spent years documenting endangered species across six continents, and I know exactly where to find those magical moments between humans and wildlife. Tell me, what animals have you always dreamed of photographing or observing in their natural habitat?`,
      'luxury-curator': `👑 Darling, welcome! I'm Isabella Sterling, and I'm here to curate the most exquisite conservation experience imaginable for you. We're going to prove that luxury and environmental responsibility create the most beautiful symphony. Picture this: private guides, Michelin-starred sustainable cuisine, and exclusive access to conservation projects that are changing the world. What's your vision of the perfect luxury conservation escape?`,
      'ex-military': `🛡️ Greetings! Captain Jake Rivers reporting for duty. I'm here to plan a conservation mission that'll make a real difference on the front lines of wildlife protection. We're talking about supporting anti-poaching operations, working alongside conservation rangers, and experiencing the raw, unfiltered reality of conservation work. Are you ready to join the fight to protect our planet's most vulnerable species?`,
      'indigenous-guide': `🌿 Greetings, friend. I'm Aiyana Earthsong, and I'm honored to walk this journey with you. The land has so much wisdom to share, and indigenous communities around the world are the guardians of both ancient knowledge and modern conservation solutions. Let's explore how you can learn from traditional ecological wisdom while supporting community-led conservation. What draws you to connect with the sacred relationship between people and nature?`,
      'climate-scientist': `🌡️ Hello! Dr. Storm Weatherby here, and I'm excited to help you plan a trip that's not just carbon-neutral, but actually contributes to climate solutions! Every destination we choose will be based on scientific evidence and measurable impact. We'll visit climate research stations, renewable energy projects, and communities adapting to climate change. What aspect of climate science and conservation interests you most?`
    };
    
    return greetings[persona.id as keyof typeof greetings] || `Hello! I'm ${persona.name}, and I'm excited to help you plan an amazing conservation travel experience!`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !persona) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setStreamingMessage('');

    try {
      const request: CloudFunctionChatRequest = {
        personaId: persona.id,
        userMessage: currentInput,
        conversationHistory: messages,
        userId: currentUser?.uid
      };

      if (useStreaming) {
        // Use streaming response for real-time feel
        await CloudFunctionService.generateStreamingResponse(request, {
          onChunk: (chunk: string) => {
            setStreamingMessage(prev => prev + chunk);
          },
          onComplete: (fullResponse: string) => {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: fullResponse,
              sender: 'persona',
              timestamp: new Date(),
              personaId: persona?.id || personaId
            };
            setMessages(prev => [...prev, aiMessage]);
            setStreamingMessage('');
            setIsTyping(false);
          },
          onError: (error: string) => {
            console.error('Streaming error:', error);
            // Fallback to non-streaming
            handleNonStreamingResponse(request);
          }
        });
      } else {
        await handleNonStreamingResponse(request);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'persona',
        timestamp: new Date(),
        personaId: persona?.id || personaId
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setStreamingMessage('');
    }
  };

  const handleNonStreamingResponse = async (request: CloudFunctionChatRequest) => {
    try {
      const response = await CloudFunctionService.generatePersonaResponse(request);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'persona',
        timestamp: new Date(),
        personaId: persona?.id || personaId
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.conversationId);
      
      // Handle trip plan if generated
      if (response.tripPlan && onTripPlanGenerated) {
        const tripPlan = await CloudFunctionService.getTripPlan(response.tripPlan);
        if (tripPlan) {
          onTripPlanGenerated(tripPlan);
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  const generatePersonaResponse = (userInput: string, persona: Persona): string => {
    // This is a simplified response generator. In production, this would use Google Gemini API
    const responses = {
      'marine-biologist': [
        "That sounds fascinating! Marine ecosystems are incredibly diverse. Have you considered the Galápagos Islands? The marine life there is absolutely extraordinary, and there are several research stations where you can contribute to conservation efforts while experiencing world-class diving.",
        "Excellent choice! The coral reefs in that region are some of the most biodiverse on Earth. I'd recommend timing your visit during the spawning season - it's like witnessing underwater fireworks! We can also arrange for you to participate in coral restoration projects.",
        "Perfect! That destination has some incredible marine protected areas. The local conservation teams are doing groundbreaking work in sustainable fishing practices and marine habitat restoration. You'll love the underwater photography opportunities!"
      ],
      'wildlife-photographer': [
        "Now that's what I call a perfect shot opportunity! The lighting conditions there during that season are absolutely magical - golden hour lasts forever, and the wildlife activity is at its peak. I can arrange for you to work with local conservation photographers who know exactly where to position for the best ethical wildlife encounters.",
        "Incredible choice! That species is particularly active during those months, and the conservation project there has been documenting their behavior patterns for years. You'll have opportunities for both photography and contributing to important research data.",
        "Fantastic! The migration patterns in that area create some of the most spectacular wildlife photography opportunities on the planet. We'll make sure you have the right permits and work with guides who prioritize animal welfare above all else."
      ],
      'luxury-curator': [
        "Absolutely divine choice, darling! That destination offers the most exquisite blend of luxury and conservation impact. I'm envisioning private helicopter transfers to exclusive eco-lodges, personal conservation guides, and dining experiences featuring locally-sourced, sustainable cuisine that directly supports conservation funding.",
        "Magnificent! The luxury conservation resort there is simply unparalleled - they've managed to create an experience that's both indulgent and deeply meaningful. Every dollar spent directly funds anti-poaching efforts and community development. Shall we discuss private wildlife viewing experiences?",
        "Exquisite taste! That location offers the kind of exclusive access that money simply can't buy elsewhere. We're talking about private conservancy areas, personal meetings with leading conservationists, and accommodations that redefine sustainable luxury."
      ]
    };

    const personaResponses = responses[persona.id as keyof typeof responses] || [
      "That's a wonderful idea! Let me help you plan something amazing that aligns with your conservation interests.",
      "I love your enthusiasm for conservation travel! Based on what you've shared, I have some incredible suggestions.",
      "Perfect! Your passion for making a positive impact while traveling is exactly what the world needs more of."
    ];

    return personaResponses[Math.floor(Math.random() * personaResponses.length)];
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!persona) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Persona not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${persona.backgroundColor} 0%, ${alpha(persona.backgroundColor, 0.8)} 100%)`,
          color: '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                backgroundColor: alpha('#ffffff', 0.2),
                color: '#ffffff',
                mr: 2,
                fontSize: '1.2rem'
              }}
            >
              {persona.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {persona.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {persona.title}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${persona.travelStyle} expert`}
              size="small"
              sx={{
                backgroundColor: alpha('#ffffff', 0.2),
                color: '#ffffff',
                textTransform: 'capitalize'
              }}
            />
            <IconButton sx={{ color: '#ffffff' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.5)
        }}
      >
        {messages.map((message) => (
          <Fade key={message.id} in timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                {message.sender === 'persona' && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: persona.backgroundColor,
                      color: '#ffffff',
                      fontSize: '0.8rem'
                    }}
                  >
                    {persona.icon}
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.sender === 'user' 
                      ? persona.backgroundColor 
                      : 'white',
                    color: message.sender === 'user' ? '#ffffff' : 'text.primary',
                    borderRadius: 2,
                    '&:hover': {
                      elevation: 2
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      textAlign: message.sender === 'user' ? 'right' : 'left'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Fade>
        ))}

        {(isTyping || streamingMessage) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: persona.backgroundColor,
                color: '#ffffff',
                fontSize: '0.8rem'
              }}
            >
              {persona.icon}
            </Avatar>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, minWidth: streamingMessage ? '200px' : 'auto' }}>
              {streamingMessage ? (
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {streamingMessage}
                  <Box component="span" sx={{ animation: 'blink 1s infinite' }}>|</Box>
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    {persona.name} is typing...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton size="small" color="primary">
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={`Message ${persona.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '&:hover fieldset': {
                  borderColor: persona.backgroundColor,
                },
                '&.Mui-focused fieldset': {
                  borderColor: persona.backgroundColor,
                }
              }
            }}
          />
          <IconButton size="small" color="primary">
            <MicIcon />
          </IconButton>
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            sx={{
              backgroundColor: persona.backgroundColor,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: alpha(persona.backgroundColor, 0.8),
              },
              '&:disabled': {
                backgroundColor: alpha(persona.backgroundColor, 0.3),
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonaChat;
