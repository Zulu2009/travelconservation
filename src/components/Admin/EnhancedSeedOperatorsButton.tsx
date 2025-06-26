import React, { useState, useEffect } from 'react';
import { 
  Button, 
  CircularProgress, 
  Alert, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  LinearProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { collection, getDocs, deleteDoc, doc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { seedComprehensiveOperators } from '../../utils/comprehensiveSeeding';
import { testCurrentApiKey } from '../../utils/testFirebaseApiKey';

interface DatabaseStats {
  operatorCount: number;
  collections: string[];
  error?: string;
}

const EnhancedSeedOperatorsButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [seedingProgress, setSeedingProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setIsLoading(true);
    try {
      // Get operators count
      const operatorsSnapshot = await getDocs(collection(db, 'operators'));
      
      // Test basic connectivity
      const testDoc = await addDoc(collection(db, 'test-connectivity'), {
        timestamp: new Date(),
        testId: `test-${Date.now()}`
      });
      
      // Clean up test doc
      await deleteDoc(testDoc);

      setStats({
        operatorCount: operatorsSnapshot.size,
        collections: ['operators', 'test-connectivity']
      });

      if (operatorsSnapshot.size === 0) {
        setMessage({
          type: 'warning',
          text: '⚠️ No operators found in database. Ready for seeding!'
        });
      } else {
        setMessage({
          type: 'info',
          text: `📊 Database contains ${operatorsSnapshot.size} operators`
        });
      }

    } catch (error) {
      console.error('❌ Error loading database stats:', error);
      setStats({
        operatorCount: 0,
        collections: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setMessage({
        type: 'error',
        text: `❌ Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async () => {
    setIsTestingApiKey(true);
    setMessage(null);
    
    try {
      console.log('🔑 Testing current Firebase API key...');
      const result = await testCurrentApiKey();
      
      if (result.valid) {
        setMessage({
          type: 'success',
          text: `✅ API Key is valid and working! Database connection successful.`
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ API Key test failed: ${result.error}. Please check the Firebase API Key Renewal Guide.`
        });
      }
    } catch (error) {
      console.error('❌ Error testing API key:', error);
      setMessage({
        type: 'error',
        text: `❌ API Key test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingApiKey(false);
    }
  };

  const clearDatabase = async () => {
    setIsClearingDatabase(true);
    setMessage(null);
    
    try {
      const operatorsSnapshot = await getDocs(collection(db, 'operators'));
      const totalDocs = operatorsSnapshot.size;
      
      if (totalDocs === 0) {
        setMessage({
          type: 'info',
          text: '📊 Database is already empty'
        });
        return;
      }

      console.log(`🗑️ Clearing ${totalDocs} operators from database...`);
      
      // Delete in batches
      const batchSize = 500;
      let processed = 0;
      
      for (let i = 0; i < operatorsSnapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = operatorsSnapshot.docs.slice(i, i + batchSize);
        
        for (const docSnapshot of batchDocs) {
          batch.delete(docSnapshot.ref);
        }
        
        await batch.commit();
        processed += batchDocs.length;
        console.log(`🗑️ Deleted ${processed}/${totalDocs} operators`);
      }

      setMessage({
        type: 'success',
        text: `🗑️ Successfully cleared ${totalDocs} operators from database`
      });
      
      await loadDatabaseStats();

    } catch (error) {
      console.error('❌ Error clearing database:', error);
      setMessage({
        type: 'error',
        text: `❌ Error clearing database: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsClearingDatabase(false);
      setShowClearDialog(false);
    }
  };

  const handleComprehensiveSeeding = async () => {
    setIsSeeding(true);
    setMessage(null);
    setSeedingProgress({ current: 0, total: 400, stage: 'Initializing...' });
    
    try {
      console.log('🚀 Starting comprehensive seeding of 400 operators...');
      
      // Create progress tracking wrapper
      await seedComprehensiveOperatorsWithProgress(400);
      
      setMessage({
        type: 'success',
        text: '🎉 Successfully seeded 400+ comprehensive operators! Check the Directory page.'
      });
      
      await loadDatabaseStats();

    } catch (error) {
      console.error('❌ Error during comprehensive seeding:', error);
      setMessage({
        type: 'error',
        text: `❌ Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSeeding(false);
      setSeedingProgress(null);
    }
  };

  const seedComprehensiveOperatorsWithProgress = async (count: number) => {
    try {
      setSeedingProgress({ current: 0, total: count, stage: 'Generating operator data...' });
      
      // Generate operators data
      const { generateComprehensiveOperators } = await import('../../utils/comprehensiveSeeding');
      const operators = generateComprehensiveOperators(count);
      
      setSeedingProgress({ current: 0, total: operators.length, stage: 'Writing to database...' });
      
      const batchSize = 500;
      let processed = 0;
      
      // Process in batches with progress updates
      for (let i = 0; i < operators.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchOperators = operators.slice(i, i + batchSize);
        
        setSeedingProgress({ 
          current: processed, 
          total: operators.length, 
          stage: `Writing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(operators.length / batchSize)}...` 
        });
        
        for (const operator of batchOperators) {
          const docRef = doc(collection(db, 'operators'));
          batch.set(docRef, {
            ...operator,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        await batch.commit();
        processed += batchOperators.length;
        
        setSeedingProgress({ 
          current: processed, 
          total: operators.length, 
          stage: `Completed ${processed}/${operators.length} operators` 
        });
        
        console.log(`✅ Processed ${processed}/${operators.length} operators`);
      }
      
      setSeedingProgress({ 
        current: operators.length, 
        total: operators.length, 
        stage: 'Seeding complete!' 
      });
      
    } catch (error) {
      console.error('❌ Error in seeding with progress:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading database status...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5" gutterBottom>
        🚀 Enhanced Database Seeding System
      </Typography>
      
      {/* Database Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Database Status
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Chip 
              label={`${stats?.operatorCount || 0} Operators`} 
              color={stats?.operatorCount ? "success" : "default"}
              variant="outlined"
            />
            <Chip 
              label={stats?.error ? "Connection Error" : "Connected"} 
              color={stats?.error ? "error" : "success"}
              variant="outlined"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={loadDatabaseStats}
              disabled={isLoading}
            >
              🔄 Refresh
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={testApiKey}
              disabled={isTestingApiKey}
              startIcon={isTestingApiKey ? <CircularProgress size={16} /> : null}
            >
              {isTestingApiKey ? 'Testing...' : '🔑 Test API Key'}
            </Button>
          </Stack>
          
          {stats?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ {stats.error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Seeding Progress */}
      {seedingProgress && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🌱 Seeding Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {seedingProgress.stage}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(seedingProgress.current / seedingProgress.total) * 100}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption">
              {seedingProgress.current} / {seedingProgress.total} operators
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Actions
          </Typography>
          
          <Stack spacing={2}>
            {/* Comprehensive Seeding */}
            <Box>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handleComprehensiveSeeding}
                disabled={isSeeding || isClearingDatabase}
                startIcon={isSeeding ? <CircularProgress size={20} /> : null}
                sx={{ mb: 1 }}
              >
                {isSeeding ? 'Seeding in Progress...' : '🚀 Seed 400+ Comprehensive Operators'}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Generate and seed 400+ diverse conservation operators worldwide
              </Typography>
            </Box>

            <Divider />

            {/* Database Management */}
            <Box>
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                onClick={() => setShowClearDialog(true)}
                disabled={isSeeding || isClearingDatabase || !stats?.operatorCount}
                startIcon={isClearingDatabase ? <CircularProgress size={20} /> : null}
              >
                {isClearingDatabase ? 'Clearing...' : '🗑️ Clear Database'}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Remove all existing operators (use before re-seeding)
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Clear Database Confirmation Dialog */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>⚠️ Confirm Database Clearing</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all {stats?.operatorCount} operators from the database? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
          <Button onClick={clearDatabase} color="warning" variant="contained">
            Clear Database
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedSeedOperatorsButton;
