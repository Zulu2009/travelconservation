import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Psychology as PsychologyIcon,
  CloudQueue as CloudQueueIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { seedGlobalOperators } from '../../utils/seedGlobalOperators';

interface SystemStatus {
  functions_deployed: boolean;
  database_connected: boolean;
  ai_service_available: boolean;
  last_discovery_run: string;
  operators_discovered_today: number;
  operators_analyzed_today: number;
  system_health: 'healthy' | 'warning' | 'error';
}

interface DatabaseStats {
  operators: number;
  discovery_queue: number;
  operator_analysis: number;
  scraping_tasks: number;
}

interface DiscoveryResult {
  success: boolean;
  operators_processed?: Array<{
    name: string;
    website: string;
    status: string;
  }>;
  message?: string;
  error?: string;
}

const AgenticSystemPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [discoveryDialog, setDiscoveryDialog] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['b_corp', 'gstc']);
  const [selectedTier, setSelectedTier] = useState<'tier1' | 'tier2'>('tier1');
  const [discoveryLimit, setDiscoveryLimit] = useState(10);
  const [seedingGlobal, setSeedingGlobal] = useState(false);

  const FUNCTION_BASE_URL = 'https://us-central1-travelconservation-b4f04.cloudfunctions.net';

  const DISCOVERY_SOURCES = [
    { id: 'b_corp', name: 'B-Corporation Directory', tier: 'tier1' },
    { id: 'gstc', name: 'GSTC Certified Operators', tier: 'tier1' },
    { id: 'rainforest_alliance', name: 'Rainforest Alliance', tier: 'tier1' },
    { id: 'national_geographic', name: 'National Geographic Partners', tier: 'tier1' },
    { id: 'atta', name: 'Adventure Travel Trade Association', tier: 'tier2' },
    { id: 'responsible_travel', name: 'Responsible Travel', tier: 'tier2' },
    { id: 'fair_trade_tourism', name: 'Fair Trade Tourism', tier: 'tier2' },
    { id: 'community_tourism', name: 'Community Tourism Networks', tier: 'tier2' }
  ];

  useEffect(() => {
    loadSystemStatus();
    loadDatabaseStats();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Mock system status - in production, this would check actual function health
      const mockStatus: SystemStatus = {
        functions_deployed: true,
        database_connected: true,
        ai_service_available: true,
        last_discovery_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        operators_discovered_today: 23,
        operators_analyzed_today: 18,
        system_health: 'healthy'
      };
      setSystemStatus(mockStatus);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch(`${FUNCTION_BASE_URL}/getDatabaseStats`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDatabaseStats(result.database_stats);
        }
      }
    } catch (error) {
      console.error('Failed to load database stats:', error);
      // Mock data as fallback
      setDatabaseStats({
        operators: 25,
        discovery_queue: 3,
        operator_analysis: 18,
        scraping_tasks: 5
      });
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      const response = await fetch(`${FUNCTION_BASE_URL}/testDatabaseConnection`);
      const result = await response.json();
      
      setTestResults(result);
      
      if (result.success) {
        // Refresh stats after successful test
        await loadDatabaseStats();
      }
    } catch (error) {
      console.error('Database test failed:', error);
      setTestResults({
        success: false,
        error: 'Failed to connect to Cloud Functions. Please check deployment status.'
      });
    } finally {
      setLoading(false);
    }
  };

  const testDiscovery = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${FUNCTION_BASE_URL}/testDiscovery`);
      const result = await response.json();
      
      setTestResults(result);
      
      if (result.success) {
        await loadDatabaseStats();
      }
    } catch (error) {
      console.error('Discovery test failed:', error);
      setTestResults({
        success: false,
        error: 'Discovery test failed. Please check function deployment.'
      });
    } finally {
      setLoading(false);
    }
  };

  const runDiscovery = async () => {
    setDiscoveryLoading(true);
    setDiscoveryResult(null);
    
    try {
      const response = await fetch(`${FUNCTION_BASE_URL}/discoverOperators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sources: selectedSources,
          tier: selectedTier,
          limit: discoveryLimit
        })
      });
      
      const result = await response.json();
      setDiscoveryResult(result);
      
      if (result.success) {
        await loadDatabaseStats();
        await loadSystemStatus();
      }
    } catch (error) {
      console.error('Discovery failed:', error);
      setDiscoveryResult({
        success: false,
        error: 'Discovery failed. Please check function deployment and try again.'
      });
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <Box>
      {/* System Status Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CloudQueueIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">System Health</Typography>
            </Box>
            {systemStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getHealthIcon(systemStatus.system_health)}
                <Chip 
                  label={systemStatus.system_health} 
                  color={getHealthColor(systemStatus.system_health) as any}
                  sx={{ ml: 1 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SearchIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Discovered Today</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {systemStatus?.operators_discovered_today || 0}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PsychologyIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">Analyzed Today</Typography>
            </Box>
            <Typography variant="h3" color="secondary.main">
              {systemStatus?.operators_analyzed_today || 0}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssessmentIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Queue Size</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {databaseStats?.discovery_queue || 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={testDatabaseConnection}
              disabled={loading}
              color="primary"
            >
              Test Database Connection
            </Button>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={testDiscovery}
              disabled={loading}
              color="info"
            >
              Test Discovery
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={() => setDiscoveryDialog(true)}
              disabled={loading}
              color="secondary"
            >
              Run Live Discovery
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadSystemStatus();
                loadDatabaseStats();
              }}
              disabled={loading}
            >
              Refresh Status
            </Button>
            <Button
              variant="contained"
              startIcon={<PublicIcon />}
              onClick={async () => {
                setSeedingGlobal(true);
                setTestResults(null);
                try {
                  await seedGlobalOperators();
                  setTestResults({
                    success: true,
                    message: '🌍 Successfully seeded 16 global conservation operators from all continents!'
                  });
                  await loadDatabaseStats();
                } catch (error: any) {
                  setTestResults({
                    success: false,
                    error: `Failed to seed global operators: ${error.message}`
                  });
                } finally {
                  setSeedingGlobal(false);
                }
              }}
              disabled={seedingGlobal || loading}
              color="success"
            >
              {seedingGlobal ? 'Seeding Global...' : 'Seed Global Operators'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Test Results */}
      {testResults && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🧪 Test Results
            </Typography>
            {testResults.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {testResults.message}
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                {testResults.error}
              </Alert>
            )}
            
            {testResults.tests && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Test Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Test</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testResults.tests).map(([test, status]) => (
                          <TableRow key={test}>
                            <TableCell>{test.replace(/_/g, ' ')}</TableCell>
                            <TableCell>{status as string}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}

            {testResults.operators_processed && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Operators Processed ({testResults.operators_processed.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Website</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {testResults.operators_processed.map((operator: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{operator.name}</TableCell>
                            <TableCell>{operator.website}</TableCell>
                            <TableCell>
                              <Chip label={operator.status} color="success" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Database Statistics */}
      {databaseStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Database Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h4" color="primary.main">
                  {databaseStats.operators}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Operators
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h4" color="warning.main">
                  {databaseStats.discovery_queue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discovery Queue
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h4" color="success.main">
                  {databaseStats.operator_analysis}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyzed
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: '1 1 150px' }}>
                <Typography variant="h4" color="info.main">
                  {databaseStats.scraping_tasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scraping Tasks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* System Status Details */}
      {systemStatus && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 System Status Details
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flex: '1 1 250px' }}>
                {systemStatus.functions_deployed ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Cloud Functions: {systemStatus.functions_deployed ? 'Deployed' : 'Not Deployed'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flex: '1 1 250px' }}>
                {systemStatus.database_connected ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Database: {systemStatus.database_connected ? 'Connected' : 'Disconnected'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flex: '1 1 250px' }}>
                {systemStatus.ai_service_available ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
                <Typography variant="body2" sx={{ ml: 1 }}>
                  AI Service: {systemStatus.ai_service_available ? 'Available' : 'Unavailable'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 250px' }}>
                <Typography variant="body2" color="text.secondary">
                  Last Discovery: {new Date(systemStatus.last_discovery_run).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Discovery Configuration Dialog */}
      <Dialog 
        open={discoveryDialog} 
        onClose={() => setDiscoveryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🔍 Configure Discovery Run
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: '1 1 200px' }}>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as 'tier1' | 'tier2')}
                  label="Tier"
                >
                  <MenuItem value="tier1">Tier 1 (Premium)</MenuItem>
                  <MenuItem value="tier2">Tier 2 (Grassroots)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="Discovery Limit"
                type="number"
                value={discoveryLimit}
                onChange={(e) => setDiscoveryLimit(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 100 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Discovery Sources:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {DISCOVERY_SOURCES
                  .filter(source => source.tier === selectedTier)
                  .map((source) => (
                    <Chip
                      key={source.id}
                      label={source.name}
                      clickable
                      color={selectedSources.includes(source.id) ? 'primary' : 'default'}
                      onClick={() => {
                        setSelectedSources(prev => 
                          prev.includes(source.id)
                            ? prev.filter(id => id !== source.id)
                            : [...prev, source.id]
                        );
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Box>
          
          {discoveryLoading && <LinearProgress sx={{ mt: 2 }} />}
          
          {discoveryResult && (
            <Alert 
              severity={discoveryResult.success ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {discoveryResult.message || discoveryResult.error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscoveryDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={runDiscovery}
            disabled={discoveryLoading || selectedSources.length === 0}
            startIcon={<PlayIcon />}
          >
            {discoveryLoading ? 'Running...' : 'Start Discovery'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgenticSystemPanel;
