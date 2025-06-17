import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Verified as VerifiedIcon,
  Assessment as AssessmentIcon,
  SmartToy as AIIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  People as PeopleIcon,
  Park as EcoIcon
} from '@mui/icons-material';
import { useOperators } from '../../hooks/useOperators';
import AgenticSystemTest from '../../components/Debug/AgenticSystemTest';

const NerdMode: React.FC = () => {
  const [aiQuery, setAIQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [sortBy, setSortBy] = useState('trustScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get all operators for analytics
  const { operators, loading, error } = useOperators();

  // Calculate comprehensive statistics
  const stats = React.useMemo(() => {
    if (!operators.length) return null;

    const verified = operators.filter(op => op.verificationStatus === 'verified');
    const avgTrustScore = operators.reduce((sum, op) => sum + op.trustScore, 0) / operators.length;
    const avgSustainabilityRating = operators.reduce((sum, op) => sum + op.sustainabilityRating, 0) / operators.length;
    
    const riskDistribution = {
      low: operators.filter(op => op.riskLevel === 'low').length,
      medium: operators.filter(op => op.riskLevel === 'medium').length,
      high: operators.filter(op => op.riskLevel === 'high').length
    };

    const sourceDistribution = operators.reduce((acc, op) => {
      acc[op.source] = (acc[op.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metricsAvg = operators
      .filter(op => op.metrics)
      .reduce((acc, op) => {
        const m = op.metrics!;
        return {
          overallScore: acc.overallScore + m.overallScore,
          conservationROI: acc.conservationROI + m.conservationROI,
          communityROI: acc.communityROI + m.communityROI,
          sustainabilityIndex: acc.sustainabilityIndex + m.sustainabilityIndex,
          impactScore: acc.impactScore + m.impactScore,
          transparencyScore: acc.transparencyScore + m.transparencyScore,
          localBenefit: acc.localBenefit + m.localBenefit,
          count: acc.count + 1
        };
      }, {
        overallScore: 0, conservationROI: 0, communityROI: 0, sustainabilityIndex: 0,
        impactScore: 0, transparencyScore: 0, localBenefit: 0, count: 0
      });

    // Divide by count to get averages
    Object.keys(metricsAvg).forEach(key => {
      if (key !== 'count' && metricsAvg.count > 0) {
        (metricsAvg as any)[key] = (metricsAvg as any)[key] / metricsAvg.count;
      }
    });

    return {
      total: operators.length,
      verified: verified.length,
      verificationRate: verified.length / operators.length,
      avgTrustScore,
      avgSustainabilityRating,
      riskDistribution,
      sourceDistribution,
      metricsAvg,
      topPerformers: operators
        .filter(op => op.trustScore > 8)
        .sort((a, b) => b.trustScore - a.trustScore)
        .slice(0, 5)
    };
  }, [operators]);

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setIsQuerying(true);
    try {
      // Simulate AI processing - in real implementation, call your LLM service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Parse the query and filter/sort operators
      const filteredOperators = processAIQuery(aiQuery, operators);
      setQueryResult(filteredOperators);
    } catch (error) {
      console.error('AI query failed:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  // Simple AI query processor (replace with actual LLM integration)
  const processAIQuery = (query: string, data: any[]) => {
    const lowercaseQuery = query.toLowerCase();
    
    // Parse common query patterns
    if (lowercaseQuery.includes('highest trust score')) {
      return data.sort((a, b) => b.trustScore - a.trustScore).slice(0, 10);
    }
    if (lowercaseQuery.includes('best conservation roi')) {
      return data.filter(op => op.metrics).sort((a, b) => b.metrics!.conservationROI - a.metrics!.conservationROI).slice(0, 10);
    }
    if (lowercaseQuery.includes('low risk')) {
      return data.filter(op => op.riskLevel === 'low');
    }
    if (lowercaseQuery.includes('verified')) {
      return data.filter(op => op.verificationStatus === 'verified');
    }
    if (lowercaseQuery.includes('africa') || lowercaseQuery.includes('african')) {
      return data.filter(op => op.location.toLowerCase().includes('africa') || op.country?.toLowerCase().includes('africa'));
    }
    
    // Default: return top performers
    return data.filter(op => op.trustScore > 7).sort((a, b) => b.trustScore - a.trustScore);
  };

  const sortedOperators = React.useMemo(() => {
    const dataToSort = queryResult.length > 0 ? queryResult : operators;
    return [...dataToSort].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy.includes('.')) {
        const [obj, prop] = sortBy.split('.');
        aVal = a[obj]?.[prop] || 0;
        bVal = b[obj]?.[prop] || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
  }, [queryResult, operators, sortBy, sortOrder]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🤓 Nerd Mode: Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Advanced metrics, AI-powered queries, and deep data insights
        </Typography>
      </Box>

      {/* Top Statistics Cards */}
      {stats && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon /> System-Wide Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total Operators</Typography>
                    <PeopleIcon fontSize="large" />
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Avg Trust Score</Typography>
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.avgTrustScore.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Sustainability Avg</Typography>
                    <EcoIcon fontSize="large" />
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.avgSustainabilityRating.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">High ROI Count</Typography>
                    <VerifiedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.topPerformers.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Metrics */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Risk Distribution</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Low Risk</Typography>
                        <Typography variant="body2">{stats.riskDistribution.low} operators</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.riskDistribution.low / stats.total) * 100}
                        color="success"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Medium Risk</Typography>
                        <Typography variant="body2">{stats.riskDistribution.medium} operators</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.riskDistribution.medium / stats.total) * 100}
                        color="warning"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">High Risk</Typography>
                        <Typography variant="body2">{stats.riskDistribution.high} operators</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.riskDistribution.high / stats.total) * 100}
                        color="error"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Discovery Sources</Typography>
                    {Object.entries(stats.sourceDistribution).map(([source, count]) => (
                      <Box key={source} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{source}</Typography>
                          <Typography variant="body2">{count} operators</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(count / stats.total) * 100}
                          color="primary"
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* AI Query Interface */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon /> AI-Powered Query Interface
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ask natural language questions about the data. Try: "Show me operators with highest trust scores", 
            "Find low-risk verified operators", "Best conservation ROI in Africa"
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Ask anything about the operators data..."
              value={aiQuery}
              onChange={(e) => setAIQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
              disabled={isQuerying}
            />
            <Button 
              variant="contained" 
              onClick={handleAIQuery}
              disabled={isQuerying || !aiQuery.trim()}
              sx={{ minWidth: 120 }}
            >
              {isQuerying ? <CircularProgress size={20} /> : 'Query'}
            </Button>
          </Box>

          {/* Quick Query Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Top Trust Scores" 
              onClick={() => setAIQuery('Show me operators with highest trust scores')}
              clickable
            />
            <Chip 
              label="Best Conservation ROI" 
              onClick={() => setAIQuery('Find operators with best conservation ROI')}
              clickable
            />
            <Chip 
              label="Low Risk Only" 
              onClick={() => setAIQuery('Show me only low risk operators')}
              clickable
            />
            <Chip 
              label="Verified Operators" 
              onClick={() => setAIQuery('Show me all verified operators')}
              clickable
            />
          </Box>

          {queryResult.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Found {queryResult.length} operators matching your query
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Advanced Sorting and Filtering */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SortIcon /> Advanced Sorting & Filtering
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="trustScore">Trust Score</MenuItem>
                  <MenuItem value="sustainabilityRating">Sustainability Rating</MenuItem>
                  <MenuItem value="metrics.overallScore">Overall Score</MenuItem>
                  <MenuItem value="metrics.conservationROI">Conservation ROI</MenuItem>
                  <MenuItem value="metrics.communityROI">Community ROI</MenuItem>
                  <MenuItem value="metrics.impactScore">Impact Score</MenuItem>
                  <MenuItem value="discoveredAt">Discovery Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  label="Order"
                >
                  <MenuItem value="desc">Highest to Lowest</MenuItem>
                  <MenuItem value="asc">Lowest to Highest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                fullWidth
                onClick={() => {
                  // Export data as CSV
                  const csvData = sortedOperators.map(op => ({
                    name: op.name,
                    location: op.location,
                    trustScore: op.trustScore,
                    sustainabilityRating: op.sustainabilityRating,
                    riskLevel: op.riskLevel,
                    verificationStatus: op.verificationStatus,
                    source: op.source
                  }));
                  
                  const csv = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'operators-data.csv';
                  a.click();
                }}
              >
                Export Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Operator Metrics ({sortedOperators.length} operators)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Trust Score</TableCell>
                  <TableCell align="right">Sustainability</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Conservation ROI</TableCell>
                  <TableCell align="right">Community ROI</TableCell>
                  <TableCell align="right">Impact Score</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOperators.slice(0, 50).map((operator) => (
                  <TableRow key={operator.id} hover>
                    <TableCell>{operator.name}</TableCell>
                    <TableCell>{operator.location}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={operator.trustScore.toFixed(1)} 
                        color={operator.trustScore > 8 ? 'success' : operator.trustScore > 6 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{operator.sustainabilityRating}/5</TableCell>
                    <TableCell>
                      <Chip 
                        label={operator.riskLevel} 
                        color={operator.riskLevel === 'low' ? 'success' : operator.riskLevel === 'medium' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={operator.verificationStatus} 
                        color={operator.verificationStatus === 'verified' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {operator.metrics ? operator.metrics.conservationROI.toFixed(1) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {operator.metrics ? operator.metrics.communityROI.toFixed(1) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {operator.metrics ? operator.metrics.impactScore.toFixed(1) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip label={operator.source} variant="outlined" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {sortedOperators.length > 50 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Showing first 50 results. Use filters to narrow down your search.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Agentic System Connection Test */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReportIcon /> Agentic System Connection Test
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AgenticSystemTest />
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default NerdMode;
