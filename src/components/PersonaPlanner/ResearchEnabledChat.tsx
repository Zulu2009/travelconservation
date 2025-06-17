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
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Rating
} from '@mui/material';
import { 
  Send as SendIcon, 
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { researchAI, ResearchResponse } from '../../services/researchAI';
import { Persona } from '../../data/personas';
import { VerifiedSupplier, ResearchMetric } from '../../data/researchDatabase';

interface ChatMessage {
  id: string;
  type: 'user' | 'persona';
  content: string;
  timestamp: Date;
  provider?: string;
  researchData?: {
    sources: string[];
    suppliers: VerifiedSupplier[];
    metrics: ResearchMetric[];
    confidence: number;
  };
}

interface ResearchEnabledChatProps {
  selectedPersona: Persona;
  onTripRecommendation?: (recommendation: any) => void;
}

const ResearchEnabledChat: React.FC<ResearchEnabledChatProps> = ({
  selectedPersona,
  onTripRecommendation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('initializing');
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [showResearchDetails, setShowResearchDetails] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeResearchAI();
  }, [selectedPersona]);

  const initializeResearchAI = async () => {
    console.log('🔬 Initializing Research AI...');
    setAiStatus('initializing');
    setMessages([]);
    setConversationHistory([selectedPersona.systemPrompt]);
    
    try {
      await researchAI.initialize();
      const services = researchAI.getAvailableServices();
      setAvailableServices(services);
      
      setAiStatus('connected');
      console.log('✅ Research AI ready with services:', services);
      
      // Add enhanced greeting with research capabilities
      addMessage('persona', `${selectedPersona.greeting}

🔬 **Research Mode Active**: I now have access to our verified supplier database with trust scores, ROI metrics, and real-time conservation data. I can provide specific recommendations backed by research and verified sources.`, 'Research AI');
      
    } catch (error) {
      console.error('Research AI initialization failed:', error);
      setAiStatus('connected'); // Still allow chat with fallbacks
      addMessage('persona', selectedPersona.greeting);
    }
  };

  const addMessage = (
    type: 'user' | 'persona', 
    content: string, 
    provider?: string,
    researchData?: ChatMessage['researchData']
  ) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      provider,
      researchData
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
      // Generate research-powered AI response
      const researchResponse: ResearchResponse = await researchAI.generateResearchResponse(
        selectedPersona.systemPrompt,
        messageToSend,
        newHistory
      );

      // Add AI response with research data
      addMessage('persona', researchResponse.response, researchResponse.provider, {
        sources: researchResponse.researchSources,
        suppliers: researchResponse.supplierRecommendations,
        metrics: researchResponse.metrics,
        confidence: researchResponse.confidence
      });

      // Update conversation history with AI response
      setConversationHistory(prev => [...prev, `${selectedPersona.name}: ${researchResponse.response}`]);

    } catch (error) {
      console.error('Message generation failed:', error);
      addMessage('persona', `I apologize, but I encountered an error accessing the research database. Please try again! Error: ${error}`, 'Error');
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

  const renderSupplierCard = (supplier: VerifiedSupplier) => (
    <Card key={supplier.id} sx={{ mb: 2, border: '1px solid', borderColor: 'success.light' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
            {supplier.name}
          </Typography>
          <Chip 
            icon={<VerifiedIcon />}
            label={`Trust: ${supplier.trustScore}/10`}
            color="success"
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          📍 {supplier.location} • {supplier.type} • {supplier.priceRange}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {supplier.specialization.slice(0, 3).map((spec, idx) => (
            <Chip key={idx} label={spec} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2">
            <strong>Conservation Impact:</strong> {supplier.conservationImpact.projectsSupported} projects
          </Typography>
          <Rating value={supplier.clientReviews.averageRating} readOnly size="small" />
        </Box>

        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          "{supplier.clientReviews.recentFeedback[0]}"
        </Typography>

        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'success.dark' }}>
          ROI: {supplier.roi.conservationROI} • Verified: {supplier.verificationDate}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderMetricCard = (metric: ResearchMetric) => (
    <Card key={metric.id} sx={{ mb: 1, bgcolor: 'info.light', color: 'info.contrastText' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TrendingUpIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {metric.metric}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {metric.value}
        </Typography>
        <Typography variant="caption">
          Source: {metric.source} • Reliability: {metric.reliability} • Updated: {metric.lastUpdated}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Enhanced Status Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', fontSize: '1.5rem' }}>
              {selectedPersona.emoji}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPersona.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPersona.title} • Research Mode
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip 
                  icon={<ScienceIcon />}
                  label="Research AI Active"
                  color="success"
                  size="small"
                />
                <Chip 
                  icon={<VerifiedIcon />}
                  label="Verified Database"
                  color="info"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={resetConversation} title="Reset Conversation">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={initializeResearchAI} title="Reconnect Research AI">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
          🔬 Research capabilities: {availableServices.join(', ')}
        </Typography>

        {/* Enhanced Quick Questions */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Research-powered questions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              "Show me verified suppliers with highest trust scores",
              "What are the latest conservation metrics?",
              "Compare ROI data for different destinations",
              "Find luxury eco-lodges with proven impact"
            ].map((question, index) => (
              <Chip 
                key={index}
                label={question}
                variant="outlined"
                size="small"
                clickable
                onClick={() => handleQuickQuestion(question)}
                disabled={aiStatus !== 'connected'}
                sx={{ bgcolor: 'white' }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 3 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}>
              <Card sx={{
                maxWidth: '85%',
                bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                color: message.type === 'user' ? 'white' : 'text.primary'
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {message.type === 'persona' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {selectedPersona.name}
                        {message.provider && (
                          <Chip 
                            label={message.provider} 
                            size="small" 
                            color={message.provider.includes('Research') ? 'success' : 'info'}
                            sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                          />
                        )}
                        {message.researchData && (
                          <Chip 
                            icon={<ScienceIcon />}
                            label={`${Math.round(message.researchData.confidence * 100)}% confidence`}
                            size="small" 
                            color="success"
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

            {/* Research Data Display */}
            {message.researchData && (
              <Box sx={{ ml: message.type === 'user' ? 0 : 2, mr: message.type === 'user' ? 2 : 0 }}>
                <Accordion 
                  expanded={showResearchDetails === message.id}
                  onChange={() => setShowResearchDetails(showResearchDetails === message.id ? null : message.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                      🔬 Research Data ({message.researchData.suppliers.length} suppliers, {message.researchData.metrics.length} metrics)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Verified Suppliers */}
                    {message.researchData.suppliers.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'success.dark', fontWeight: 'bold' }}>
                          📋 Verified Suppliers
                        </Typography>
                        {message.researchData.suppliers.map(renderSupplierCard)}
                      </Box>
                    )}

                    {/* Research Metrics */}
                    {message.researchData.metrics.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'info.dark', fontWeight: 'bold' }}>
                          📊 Research Metrics
                        </Typography>
                        {message.researchData.metrics.map(renderMetricCard)}
                      </Box>
                    )}

                    {/* Research Sources */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        📚 Sources
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {message.researchData.sources.map((source, idx) => (
                          <Chip key={idx} label={source} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Card sx={{ bgcolor: 'grey.100' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {selectedPersona.name} is researching...
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
            placeholder={`Ask ${selectedPersona.name} for research-backed recommendations...`}
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

export default ResearchEnabledChat;
