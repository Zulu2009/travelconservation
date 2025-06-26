import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Rating,
  Badge
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  TravelExplore as ExploreIcon,
  Star as StarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useOperators, Operator } from '../../hooks/useOperators';
import SeedOperatorsButton from '../../components/Admin/SeedOperatorsButton';

const Directory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Get operators from the agentic system
  const { operators, loading, error } = useOperators({
    verificationStatus: verificationFilter || undefined,
    riskLevel: riskFilter || undefined,
    country: countryFilter || undefined,
    minTrustScore: 0
  });

  // Filter operators based on search term
  const filteredOperators = operators.filter(operator => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const name = operator.name || '';
    const location = operator.location || '';
    const description = operator.description || '';
    
    return name.toLowerCase().includes(searchLower) ||
           location.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'needs-review': return 'info';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getUniqueCountries = () => {
    return Array.from(new Set(operators.map(op => op.country).filter(Boolean))).sort();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading operators from agentic discovery system...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading operators: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🌍 Sustainable Travel Directory
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          AI-discovered and verified sustainable travel operators
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <Chip 
            icon={<VerifiedIcon />} 
            label={`${operators.filter(op => op.verificationStatus === 'verified').length} Verified`}
            color="success"
            variant="outlined"
          />
          <Chip 
            icon={<ExploreIcon />} 
            label={`${operators.length} Total Operators`}
            color="primary"
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            Last updated: Real-time via agentic discovery
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>🔍 Search & Filter</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, location, or description"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                label="Verification Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="needs-review">Needs Review</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                label="Risk Level"
              >
                <MenuItem value="">All Risk Levels</MenuItem>
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="medium">Medium Risk</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                label="Country"
              >
                <MenuItem value="">All Countries</MenuItem>
                {getUniqueCountries().map(country => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          {filteredOperators.length} operators found
          {searchTerm && ` for "${searchTerm}"`}
        </Typography>
      </Box>

      {/* No Results */}
      {filteredOperators.length === 0 && operators.length === 0 && (
        <Box sx={{ mt: 4 }}>
          <SeedOperatorsButton />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>🤖 Agentic Discovery System Ready</Typography>
            <Typography>
              No operators have been discovered yet. You can either seed the database with sample operators above, 
              or visit the Admin Dashboard to run the full agentic discovery system.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => window.location.href = '/admin'}
            >
              Go to Admin Dashboard
            </Button>
          </Alert>
        </Box>
      )}

      {filteredOperators.length === 0 && operators.length > 0 && (
        <Alert severity="info">
          No operators match your current filters. Try adjusting your search criteria.
        </Alert>
      )}

      {/* Operators Grid */}
      <Grid container spacing={3}>
        {filteredOperators.map((operator) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={operator.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                transition: 'all 0.3s ease'
              }}
            >
              {/* Verification Badge */}
              {operator.verificationStatus === 'verified' && (
                <Badge
                  badgeContent={<VerifiedIcon sx={{ fontSize: 16 }} />}
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {operator.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {operator.location}
                    </Typography>
                  </Box>

                  {/* Trust Score */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="bold">
                      Trust Score: {operator.trustScore > 0 ? operator.trustScore.toFixed(1) : 'Calculating...'}
                    </Typography>
                    {operator.trustScore > 0 && (
                      <Rating 
                        value={operator.trustScore / 2} 
                        precision={0.1} 
                        size="small" 
                        readOnly 
                      />
                    )}
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {operator.description && operator.description.length > 150 
                    ? `${operator.description.substring(0, 150)}...` 
                    : operator.description || 'No description available'}
                </Typography>

                {/* Status Chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label={operator.verificationStatus}
                    color={getVerificationColor(operator.verificationStatus) as any}
                    size="small"
                  />
                  <Chip
                    label={`${operator.riskLevel} risk`}
                    color={getRiskColor(operator.riskLevel) as any}
                    size="small"
                  />
                  <Chip
                    label={operator.source}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {/* Metrics */}
                {operator.metrics && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      AI Analysis Metrics:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption">
                          Overall: {operator.metrics.overallScore.toFixed(1)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption">
                          Sustainability: {operator.sustainabilityRating}/5
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Discovery Info */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Discovered: {operator.discoveredAt ? 
                    new Date(operator.discoveredAt).toLocaleDateString() : 
                    'Recently'
                  }
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
                {operator.website && (
                  <Button 
                    size="small" 
                    color="secondary"
                    onClick={() => window.open(operator.website, '_blank')}
                  >
                    Visit Website
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer Info */}
      {operators.length > 0 && (
        <Box sx={{ mt: 6, p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🤖 Powered by AI Discovery
          </Typography>
          <Typography variant="body2">
            This directory is automatically populated by our agentic research system, which continuously 
            discovers and verifies sustainable travel operators from premium sources including B-Corp, 
            GSTC, and other certification bodies. All operators undergo AI-powered vetting for quality assurance.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Directory;
