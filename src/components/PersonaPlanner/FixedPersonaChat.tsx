import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { smartAI } from '../../services/geminiAI';
import { Persona } from '../../data/personas';

interface ChatMessage {
  id: string;
  type: 'user' | 'persona';
  content: string;
  timestamp: Date;
  provider?: string;
}

interface FixedPersonaChatProps {
  selectedPersona: Persona;
  onTripRecommendation?: (recommendation: any) => void;
}

const FixedPersonaChat: React.FC<FixedPersonaChatProps> = ({
  selectedPersona,
  onTripRecommendation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('initializing');
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeAI();
  }, [selectedPersona]);

  const initializeAI = async () => {
    console.log('🔄 Initializing AI services...');
    setAiStatus('initializing');
    setMessages([]);
    setConversationHistory([selectedPersona.systemPrompt]);
    
    try {
      await smartAI.initialize();
      const services = smartAI.getAvailableServices();
      setAvailableServices(services);
      
      if (smartAI.isAIAvailable()) {
        setAiStatus('connected');
        console.log('✅ AI is available and ready');
      } else {
        setAiStatus('connected'); // Still connected, just using fallbacks
        console.log('⚠️ AI unavailable, using intelligent fallbacks');
      }
      
      // Always add greeting message
      addMessage('persona', selectedPersona.greeting);
      
    } catch (error) {
      console.error('AI initialization failed:', error);
      setAiStatus('connected'); // Still allow chat with fallbacks
      addMessage('persona', selectedPersona.greeting);
    }
  };

  const addMessage = (type: 'user' | 'persona', content: string, provider?: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      provider
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading || aiStatus !== 'connected') return;

    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    // Add user message
    addMessage('user', messageToSend);

    // Update conversation history
    const newHistory = [...conversationHistory, `User: ${messageToSend}`];
    setConversationHistory(newHistory);

    try {
      // Generate AI response
      const { response, provider } = await smartAI.generatePersonaResponse(
        selectedPersona.systemPrompt,
        messageToSend,
        newHistory
      );

      setCurrentProvider(provider);
      addMessage('persona', response, provider);

      // Update conversation history with AI response
      setConversationHistory(prev => [...prev, `${selectedPersona.name}: ${response}`]);

    } catch (error) {
      console.error('Message generation failed:', error);
      addMessage('persona', `I apologize, but I encountered an error. Please try again! Error: ${error}`, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
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
    setMessages([]);
    setConversationHistory([selectedPersona.systemPrompt]);
    addMessage('persona', selectedPersona.greeting);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
              {selectedPersona.emoji}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPersona.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPersona.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={aiStatus === 'connected' ? (smartAI.isAIAvailable() ? 'AI Connected' : 'Smart Fallback') : aiStatus === 'initializing' ? 'Connecting...' : 'AI Offline'}
                  color={aiStatus === 'connected' ? (smartAI.isAIAvailable() ? 'success' : 'warning') : aiStatus === 'initializing' ? 'info' : 'error'}
                  size="small"
                />
                {currentProvider && (
                  <Chip label={`via ${currentProvider}`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={resetConversation} title="Reset Conversation">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={initializeAI} title="Reconnect AI">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {availableServices.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            Available AI services: {availableServices.join(', ')}
          </Typography>
        )}

        {/* Quick Questions */}
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
                disabled={aiStatus !== 'connected'}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {aiStatus === 'connected' && !smartAI.isAIAvailable() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Using Smart Fallback Mode</Typography>
          <Typography variant="body2">
            AI services are temporarily unavailable, but I can still provide expert conservation travel advice!<br/>
            • Responses are based on extensive conservation expertise<br/>
            • All recommendations are real and actionable<br/>
            • Try refreshing to reconnect to AI services
          </Typography>
        </Alert>
      )}

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{
            display: 'flex',
            justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
            mb: 2
          }}>
            <Card sx={{
              maxWidth: '80%',
              bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
              color: message.type === 'user' ? 'white' : 'text.primary'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {message.type === 'persona' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {selectedPersona.name}
                      {message.provider && message.provider !== 'Fallback' && (
                        <Chip 
                          label={message.provider} 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
                      )}
                      {message.provider === 'Fallback' && (
                        <Chip 
                          label="Offline" 
                          size="small" 
                          color="warning" 
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
            disabled={isLoading || aiStatus !== 'connected'}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading || aiStatus !== 'connected'}
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

export default FixedPersonaChat;
