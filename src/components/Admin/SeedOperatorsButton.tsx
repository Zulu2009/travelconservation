import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { seedOperators, checkIfSeedingNeeded } from '../../utils/seedOperators';

const SeedOperatorsButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [needsSeeding, setNeedsSeeding] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkSeedingStatus();
  }, []);

  const checkSeedingStatus = async () => {
    try {
      const isEmpty = await checkIfSeedingNeeded();
      setNeedsSeeding(isEmpty);
    } catch (error) {
      console.error('Error checking seeding status:', error);
      setNeedsSeeding(true);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMessage(null);
    
    try {
      await seedOperators();
      setMessage({
        type: 'success',
        text: '🎉 Successfully seeded database with 8 sample operators! Check the Directory page.'
      });
      setNeedsSeeding(false);
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

  if (needsSeeding === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Checking database status...</Typography>
      </Box>
    );
  }

  if (!needsSeeding) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        ✅ Database already contains operators data. Check the Directory page to see them.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🌱 Populate Directory with Sample Operators
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The operators database is empty. Seed it with sample sustainable travel operators 
        to populate the Directory page and test the agentic system.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleSeedDatabase}
        disabled={isSeeding}
        startIcon={isSeeding ? <CircularProgress size={20} /> : null}
        sx={{ mb: 2 }}
      >
        {isSeeding ? 'Seeding Database...' : '🌱 Seed Database with Sample Operators'}
      </Button>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
    </Box>
  );
};

export default SeedOperatorsButton;
