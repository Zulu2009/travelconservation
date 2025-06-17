import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { smartAI, geminiService } from '../../services/geminiAI';

const GeminiTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Hello! Please introduce yourself as a conservation travel expert.');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>('');

  useEffect(() => {
    // Debug setup on component mount
    console.log('=== Gemini AI Debug Info ===');
    console.log('API Key:', process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('============================');
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    setErrorDetails(null);
    
    try {
      const result = await geminiService.testConnection();
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(result.message || 'Unknown error');
        setErrorDetails({ originalMessage: result.message });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error.message);
    }
  };

  const handleTestGeneration = async () => {
    if (!testPrompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationError('');
    setTestResponse('');
    
    try {
      const { response } = await smartAI.generatePersonaResponse(
        'You are a helpful AI assistant.',
        testPrompt
      );
      setTestResponse(response);
    } catch (error: any) {
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'testing': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success': return 'Connected';
      case 'error': return 'Failed';
      case 'testing': return 'Testing...';
      default: return 'Not Tested';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 Gemini AI Debug Console
      </Typography>
      
      {/* Environment Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Environment Information
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label={`Environment: ${process.env.NODE_ENV}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`API Key: ${process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing'}`}
              color={process.env.REACT_APP_GEMINI_API_KEY ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
          {process.env.REACT_APP_GEMINI_API_KEY && (
            <Typography variant="body2" color="text.secondary">
              API Key: {process.env.REACT_APP_GEMINI_API_KEY.substring(0, 10)}...
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Connection Test
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing'}
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            <Chip 
              label={getStatusText()}
              color={getStatusColor()}
              variant={connectionStatus ? 'filled' : 'outlined'}
            />
          </Box>
          
          {connectionStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Connection Failed:</strong> {connectionError}
              </Typography>
              {errorDetails && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" component="div">
                    <strong>Error Details:</strong>
                  </Typography>
                  <Typography variant="caption" component="div">
                    Status: {errorDetails.status || 'N/A'}
                  </Typography>
                  <Typography variant="caption" component="div">
                    Status Text: {errorDetails.statusText || 'N/A'}
                  </Typography>
                  <Typography variant="caption" component="div">
                    Original Message: {errorDetails.originalMessage || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Alert>
          )}
          
          {connectionStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                ✅ Gemini API connection successful! Ready to generate responses.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Response Generation Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Response Generation Test
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Test Prompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Enter a prompt to test AI response generation..."
          />
          
          <Button 
            variant="contained" 
            onClick={handleTestGeneration}
            disabled={isGenerating || !testPrompt.trim()}
            sx={{ mb: 2 }}
          >
            {isGenerating ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              'Generate AI Response'
            )}
          </Button>
          
          {generationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Generation Failed:</strong> {generationError}
              </Typography>
            </Alert>
          )}
          
          {testResponse && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Response:
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {testResponse}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Test Prompts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Test Prompts
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              'Hello! Please respond with a simple greeting.',
              'You are Dr. Marina Torres, a marine biologist. Introduce yourself.',
              'Recommend a conservation travel destination in Kenya.',
              'What is the most important marine conservation project right now?'
            ].map((prompt, index) => (
              <Chip
                key={index}
                label={prompt.substring(0, 40) + '...'}
                clickable
                onClick={() => setTestPrompt(prompt)}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeminiTest;
