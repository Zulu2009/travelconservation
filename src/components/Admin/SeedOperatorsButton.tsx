import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box, Typography, Card, CardContent, Stack } from '@mui/material';
import { seedOperators, checkIfSeedingNeeded } from '../../utils/seedOperators';
import { seedGlobalOperators } from '../../utils/seedGlobalOperators';
import { seedComprehensiveOperators } from '../../utils/comprehensiveSeeding';
import { testFirebaseConnection, getFirestoreStatus } from '../../utils/firebaseConnectionTest';

const SeedOperatorsButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    operatorCount: number;
    error?: string;
  } | null>(null);

  React.useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      const status = await getFirestoreStatus();
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error checking Firebase status:', error);
      setConnectionStatus({
        connected: false,
        operatorCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setMessage(null);
    
    try {
      const success = await testFirebaseConnection();
      if (success) {
        setMessage({
          type: 'success',
          text: '🎉 Firebase connection successful! Database is ready for seeding.'
        });
        await checkFirebaseStatus();
      } else {
        setMessage({
          type: 'error',
          text: '❌ Firebase connection failed. Check console for details.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSeedDatabase = async (seedType: 'basic' | 'global' | 'comprehensive') => {
    setIsSeeding(true);
    setMessage(null);
    
    try {
      let count = 0;
      let description = '';
      
      switch (seedType) {
        case 'basic':
          await seedOperators();
          count = 8;
          description = 'basic African conservation operators';
          break;
        case 'global':
          await seedGlobalOperators();
          count = 16;
          description = 'global conservation operators';
          break;
        case 'comprehensive':
          await seedComprehensiveOperators(400);
          count = 400;
          description = 'comprehensive worldwide operators';
          break;
      }
      
      setMessage({
        type: 'success',
        text: `🎉 Successfully seeded database with ${count} ${description}! Check the Directory page.`
      });
      await checkFirebaseStatus();
    } catch (error) {
      console.error('Error seeding database:', error);
      setMessage({
        type: 'error',
        text: `❌ Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (connectionStatus === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Checking Firebase connection...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔥 Firebase Database Management
      </Typography>
      
      {/* Connection Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔗 Connection Status
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Alert severity={connectionStatus.connected ? 'success' : 'error'}>
                {connectionStatus.connected 
                  ? `✅ Connected - ${connectionStatus.operatorCount} operators in database`
                  : `❌ Not Connected - ${connectionStatus.error}`
                }
              </Alert>
            </Box>
            <Button
              variant="outlined"
              onClick={testConnection}
              disabled={isTestingConnection}
              startIcon={isTestingConnection ? <CircularProgress size={20} /> : null}
            >
              {isTestingConnection ? 'Testing...' : '🧪 Test Connection'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Seeding Options */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌱 Database Seeding Options
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose seeding option to populate your database with conservation travel operators
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleSeedDatabase('basic')}
                disabled={isSeeding}
                startIcon={isSeeding ? <CircularProgress size={20} /> : null}
                sx={{ mb: 1 }}
              >
                {isSeeding ? 'Seeding...' : '🌱 Basic (8 operators)'}
              </Button>
              <Typography variant="caption" display="block">
                Premium African conservation operators
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => handleSeedDatabase('global')}
                disabled={isSeeding}
                startIcon={isSeeding ? <CircularProgress size={20} /> : null}
                sx={{ mb: 1 }}
              >
                {isSeeding ? 'Seeding...' : '🌍 Global (16 operators)'}
              </Button>
              <Typography variant="caption" display="block">
                Worldwide conservation operators
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleSeedDatabase('comprehensive')}
                disabled={isSeeding}
                startIcon={isSeeding ? <CircularProgress size={20} /> : null}
                sx={{ mb: 1 }}
              >
                {isSeeding ? 'Seeding...' : '🚀 Comprehensive (400+ operators)'}
              </Button>
              <Typography variant="caption" display="block">
                Full database with diverse operators
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
    </Box>
  );
};

export default SeedOperatorsButton;
