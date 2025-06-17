import React, { useState } from 'react';
import { Box, Button, Typography, Alert, TextField } from '@mui/material';

const SimpleGeminiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testBasicAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🔧 Testing basic Gemini API call...');
      
      // Import the GoogleGenerativeAI directly
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing');
      
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      console.log('🚀 Making API call...');
      const result = await model.generateContent("Say hello and confirm you're working!");
      const response = result.response;
      const text = response.text();
      
      console.log('✅ Success:', text);
      setResult(text);
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Simple Gemini Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          API Key Status: {process.env.REACT_APP_GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}
        </Typography>
        {process.env.REACT_APP_GEMINI_API_KEY && (
          <Typography variant="body2" color="text.secondary">
            Key: {process.env.REACT_APP_GEMINI_API_KEY.substring(0, 15)}...
          </Typography>
        )}
      </Box>

      <Button 
        variant="contained" 
        onClick={testBasicAPI}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test Basic API Call'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">API Response:</Typography>
          <Typography variant="body2">{result}</Typography>
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Debug Info:
        </Typography>
        <Typography variant="body2">
          • Environment: {process.env.NODE_ENV}<br/>
          • API Key Length: {process.env.REACT_APP_GEMINI_API_KEY?.length || 0}<br/>
          • Current Time: {new Date().toISOString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleGeminiTest;
