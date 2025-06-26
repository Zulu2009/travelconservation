import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import AgenticSystemPanel from '../../components/Admin/AgenticSystemPanel';
import EnhancedSeedOperatorsButton from '../../components/Admin/EnhancedSeedOperatorsButton';
import FirebaseDiagnosticPanel from '../../components/Admin/FirebaseDiagnosticPanel';

// SYSTEM 4 - ADMIN INTERFACE
// React admin panel for data management, verification workflows, and quality control

interface SupplierSummary {
  id: string;
  name: string;
  location: string;
  trustScore: number;
  sustainabilityRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'needs-review';
  lastAudit: string;
  metrics?: {
    overallScore: number;
    conservationROI: number;
    communityROI: number;
  };
}

interface AnalyticsSummary {
  totalSuppliers: number;
  averageTrustScore: number;
  averageSustainabilityRating: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  verificationStats: {
    pending: number;
    verified: number;
    rejected: number;
    needsReview: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSummary | null>(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be API calls
      await Promise.all([
        loadSuppliers(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    // Mock data - replace with actual API call
    const mockSuppliers: SupplierSummary[] = [
      {
        id: 'finch-bay-galapagos',
        name: 'Finch Bay Eco Hotel',
        location: 'Galápagos, Ecuador',
        trustScore: 9.2,
        sustainabilityRating: 5,
        riskLevel: 'low',
        verificationStatus: 'verified',
        lastAudit: '2024-10-20',
        metrics: {
          overallScore: 9.1,
          conservationROI: 15.2,
          communityROI: 8.5
        }
      },
      {
        id: 'amboseli-porini',
        name: 'Porini Amboseli Camp',
        location: 'Amboseli, Kenya',
        trustScore: 8.9,
        sustainabilityRating: 5,
        riskLevel: 'low',
        verificationStatus: 'verified',
        lastAudit: '2024-11-10',
        metrics: {
          overallScore: 8.8,
          conservationROI: 18.1,
          communityROI: 22.3
        }
      },
      {
        id: 'new-supplier-1',
        name: 'Amazon Eco Lodge',
        location: 'Amazon, Brazil',
        trustScore: 0,
        sustainabilityRating: 0,
        riskLevel: 'medium',
        verificationStatus: 'pending',
        lastAudit: 'Never'
      }
    ];
    setSuppliers(mockSuppliers);
  };

  const loadAnalytics = async () => {
    // Mock data - replace with actual API call
    const mockAnalytics: AnalyticsSummary = {
      totalSuppliers: 25,
      averageTrustScore: 8.2,
      averageSustainabilityRating: 4.1,
      riskDistribution: {
        low: 18,
        medium: 5,
        high: 2
      },
      verificationStats: {
        pending: 8,
        verified: 15,
        rejected: 1,
        needsReview: 1
      }
    };
    setAnalytics(mockAnalytics);
  };

  const handleBatchCalculateMetrics = async () => {
    setBatchProcessing(true);
    try {
      // Call Firebase Cloud Function for batch metrics calculation
      const response = await fetch('/api/batchCalculateMetrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Batch processing complete: ${result.processed} suppliers processed`);
        await loadDashboardData();
      } else {
        throw new Error('Batch processing failed');
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      alert('Batch processing failed. Please try again.');
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleVerifySupplier = async (supplierId: string, status: 'verified' | 'rejected') => {
    try {
      // Update supplier verification status
      setSuppliers(prev => prev.map(s => 
        s.id === supplierId 
          ? { ...s, verificationStatus: status }
          : s
      ));
      
      // In real implementation, make API call to update database
      console.log(`Supplier ${supplierId} marked as ${status}`);
      
    } catch (error) {
      console.error('Verification update failed:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || supplier.verificationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'needs-review': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🛠️ Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={handleBatchCalculateMetrics}
            disabled={batchProcessing}
            color="secondary"
          >
            {batchProcessing ? 'Processing...' : 'Batch Calculate Metrics'}
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Analytics Summary Cards */}
      {analytics && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h3" color="primary.main">
                {analytics.totalSuppliers}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg Trust Score
              </Typography>
              <Typography variant="h3" color="success.main">
                {analytics.averageTrustScore.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Verification
              </Typography>
              <Typography variant="h3" color="warning.main">
                {analytics.verificationStats.pending}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                High Risk
              </Typography>
              <Typography variant="h3" color="error.main">
                {analytics.riskDistribution.high}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="🌱 Database Seeding" />
          <Tab label="Supplier Management" />
          <Tab label="Verification Queue" />
          <Tab label="Analytics & Reports" />
          <Tab label="Data Research" />
          <Tab label="🤖 Agentic System" />
        </Tabs>
      </Box>

      {/* Tab 0: Database Seeding */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FirebaseDiagnosticPanel />
          <EnhancedSeedOperatorsButton />
        </Box>
      </TabPanel>

      {/* Tab 1: Supplier Management */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="needs-review">Needs Review</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Trust Score</TableCell>
                <TableCell>Sustainability</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Audit</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{supplier.name}</Typography>
                  </TableCell>
                  <TableCell>{supplier.location}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={supplier.trustScore > 8 ? 'success.main' : supplier.trustScore > 6 ? 'warning.main' : 'error.main'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {supplier.trustScore > 0 ? supplier.trustScore.toFixed(1) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {supplier.sustainabilityRating > 0 ? `${supplier.sustainabilityRating}/5` : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.riskLevel} 
                      color={getRiskColor(supplier.riskLevel) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.verificationStatus} 
                      color={getStatusColor(supplier.verificationStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{supplier.lastAudit}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setVerificationDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {supplier.verificationStatus === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleVerifySupplier(supplier.id, 'verified')}
                          >
                            <VerifiedIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleVerifySupplier(supplier.id, 'rejected')}
                          >
                            <WarningIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 2: Verification Queue */}
      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Review suppliers pending verification. Check their documentation, certifications, and compliance before approval.
        </Alert>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {suppliers.filter(s => s.verificationStatus === 'pending' || s.verificationStatus === 'needs-review').map((supplier) => (
            <Card key={supplier.id} sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{supplier.name}</Typography>
                  <Chip 
                    label={supplier.verificationStatus} 
                    color={getStatusColor(supplier.verificationStatus) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {supplier.location}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Risk Level: <Chip label={supplier.riskLevel} color={getRiskColor(supplier.riskLevel) as any} size="small" />
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setVerificationDialog(true);
                    }}
                  >
                    Review Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="success"
                    onClick={() => handleVerifySupplier(supplier.id, 'verified')}
                  >
                    Approve
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="error"
                    onClick={() => handleVerifySupplier(supplier.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Tab 3: Analytics & Reports */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Risk Distribution</Typography>
                {analytics && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Low Risk</Typography>
                      <Typography variant="body2">{analytics.riskDistribution.low}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Medium Risk</Typography>
                      <Typography variant="body2">{analytics.riskDistribution.medium}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">High Risk</Typography>
                      <Typography variant="body2">{analytics.riskDistribution.high}</Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Verification Status</Typography>
                {analytics && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Verified</Typography>
                      <Typography variant="body2">{analytics.verificationStats.verified}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Pending</Typography>
                      <Typography variant="body2">{analytics.verificationStats.pending}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Needs Review</Typography>
                      <Typography variant="body2">{analytics.verificationStats.needsReview}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Rejected</Typography>
                      <Typography variant="body2">{analytics.verificationStats.rejected}</Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Supplier Report
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Analytics Report
          </Button>
        </Box>
      </TabPanel>

      {/* Tab 4: Data Research */}
      <TabPanel value={tabValue} index={4}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Use GPT-3.5-turbo for cost-effective bulk supplier data extraction and analysis.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Batch Data Extraction</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Extract structured data from supplier websites and descriptions using AI.
                </Typography>
                <Button variant="contained" startIcon={<SearchIcon />} disabled>
                  Start Batch Extraction (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Data Import</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Import supplier data from CSV or Excel files.
                </Typography>
                <Button variant="outlined" startIcon={<UploadIcon />} disabled>
                  Import Data (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Agentic System */}
      <TabPanel value={tabValue} index={5}>
        <AgenticSystemPanel />
      </TabPanel>

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialog} 
        onClose={() => setVerificationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Supplier Verification: {selectedSupplier?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body2">{selectedSupplier.location}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Current Status</Typography>
                  <Chip 
                    label={selectedSupplier.verificationStatus} 
                    color={getStatusColor(selectedSupplier.verificationStatus) as any}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Trust Score</Typography>
                  <Typography variant="body2">
                    {selectedSupplier.trustScore > 0 ? selectedSupplier.trustScore.toFixed(1) : 'Not calculated'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Risk Level</Typography>
                  <Chip 
                    label={selectedSupplier.riskLevel} 
                    color={getRiskColor(selectedSupplier.riskLevel) as any}
                    size="small"
                  />
                </Grid>
                {selectedSupplier.metrics && (
                  <>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="subtitle2">Overall Score</Typography>
                      <Typography variant="body2">{selectedSupplier.metrics.overallScore.toFixed(1)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="subtitle2">Conservation ROI</Typography>
                      <Typography variant="body2">{selectedSupplier.metrics.conservationROI.toFixed(1)}:1</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="subtitle2">Community ROI</Typography>
                      <Typography variant="body2">{selectedSupplier.metrics.communityROI.toFixed(1)}:1</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>
            Close
          </Button>
          {selectedSupplier?.verificationStatus === 'pending' && (
            <>
              <Button 
                color="error"
                onClick={() => {
                  handleVerifySupplier(selectedSupplier.id, 'rejected');
                  setVerificationDialog(false);
                }}
              >
                Reject
              </Button>
              <Button 
                variant="contained"
                color="success"
                onClick={() => {
                  handleVerifySupplier(selectedSupplier.id, 'verified');
                  setVerificationDialog(false);
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
