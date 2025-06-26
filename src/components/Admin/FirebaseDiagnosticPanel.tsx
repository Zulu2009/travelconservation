import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandIcon,
  CleaningServices as CleanIcon,
  BugReport as DiagnosticIcon,
  Nature as SeedIcon
} from '@mui/icons-material';
import { FirebaseDiagnostic } from '../../utils/firebaseDiagnostic';

const FirebaseDiagnosticPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [seedingResults, setSeedingResults] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults(null);
    
    try {
      console.log('🚀 Starting Firebase diagnostic...');
      const results = await FirebaseDiagnostic.runFullDiagnostic();
      setDiagnosticResults(results);
      console.log('✅ Diagnostic complete:', results);
    } catch (error: any) {
      console.error('❌ Diagnostic failed:', error);
      setDiagnosticResults({
        success: false,
        results: [{
          name: 'Diagnostic Error',
          status: 'error',
          error: error.message
        }],
        summary: 'Diagnostic failed to run'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testSeeding = async () => {
    setIsSeeding(true);
    setSeedingResults(null);
    
    try {
      console.log('🌱 Testing operator seeding...');
      const results = await FirebaseDiagnostic.testOperatorSeeding(10);
      setSeedingResults(results);
      console.log('✅ Seeding test complete:', results);
    } catch (error: any) {
      console.error('❌ Seeding test failed:', error);
      setSeedingResults({
        success: false,
        operatorsCreated: 0,
        errors: [error.message]
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const cleanupTestData = async () => {
    setIsCleaning(true);
    
    try {
      console.log('🧹 Cleaning up test data...');
      await FirebaseDiagnostic.cleanupTestData();
      console.log('✅ Cleanup complete');
      
      // Re-run diagnostic after cleanup
      setTimeout(() => {
        runDiagnostic();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Cleanup failed:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const renderDiagnosticResult = (result: any, index: number) => {
    const isSuccess = result.status === 'success';
    
    return (
      <ListItem key={index}>
        <ListItemIcon>
          {isSuccess ? (
            <SuccessIcon color="success" />
          ) : (
            <ErrorIcon color="error" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={result.name}
          secondary={
            <Box>
              {isSuccess ? (
                <Typography variant="body2" color="success.main">
                  {typeof result.details === 'string' 
                    ? result.details 
                    : JSON.stringify(result.details, null, 2)
                  }
                </Typography>
              ) : (
                <Typography variant="body2" color="error.main">
                  {result.error}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItem>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <DiagnosticIcon color="primary" />
          <Typography variant="h6">Firebase Diagnostic Center</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive testing for Firebase connectivity, database operations, and seeding functionality.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<RunIcon />}
            onClick={runDiagnostic}
            disabled={isRunning}
            color="primary"
          >
            {isRunning ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SeedIcon />}
            onClick={testSeeding}
            disabled={isSeeding}
            color="success"
          >
            {isSeeding ? 'Testing Seeding...' : 'Test Seeding (10 operators)'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CleanIcon />}
            onClick={cleanupTestData}
            disabled={isCleaning}
            color="warning"
          >
            {isCleaning ? 'Cleaning...' : 'Cleanup Test Data'}
          </Button>
        </Box>

        {/* Loading Indicators */}
        {(isRunning || isSeeding || isCleaning) && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isRunning && 'Running comprehensive Firebase diagnostic...'}
              {isSeeding && 'Testing operator seeding functionality...'}
              {isCleaning && 'Cleaning up test data from database...'}
            </Typography>
          </Box>
        )}

        {/* Diagnostic Results */}
        {diagnosticResults && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Diagnostic Results</Typography>
                <Chip 
                  label={diagnosticResults.summary}
                  color={diagnosticResults.success ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {diagnosticResults.success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  🎉 All Firebase services are working correctly! Your database is ready for seeding.
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 2 }}>
                  ❌ Some Firebase services have issues. Check the detailed results below.
                </Alert>
              )}
              
              <List>
                {diagnosticResults.results.map((result: any, index: number) => 
                  renderDiagnosticResult(result, index)
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Seeding Test Results */}
        {seedingResults && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Seeding Test Results</Typography>
                <Chip 
                  label={`${seedingResults.operatorsCreated} operators created`}
                  color={seedingResults.success ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {seedingResults.success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Seeding is working perfectly! Created {seedingResults.operatorsCreated} test operators successfully.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ Seeding partially working. Created {seedingResults.operatorsCreated} operators but encountered some errors.
                </Alert>
              )}
              
              {seedingResults.errors.length > 0 && (
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Errors encountered:</Typography>
                  {seedingResults.errors.map((error: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {error}
                    </Typography>
                  ))}
                </Paper>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Quick Fix Suggestions */}
        {diagnosticResults && !diagnosticResults.success && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>🔧 Quick Fix Suggestions</Typography>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Common Issues & Solutions:</strong><br/>
                • <strong>Configuration Error:</strong> Check your .env file has correct Firebase credentials<br/>
                • <strong>Database Connection:</strong> Verify your Firebase project is active and billing is enabled<br/>
                • <strong>Security Rules:</strong> Ensure Firestore rules allow the operations you're trying to perform<br/>
                • <strong>Network Issues:</strong> Check your internet connection and firewall settings<br/>
                • <strong>API Key Issues:</strong> Verify your Firebase API key is valid and not expired
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseDiagnosticPanel;
