import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { personas, Persona } from '../../data/personas';
import ResearchEnabledChat from '../../components/PersonaPlanner/ResearchEnabledChat';
import { seedResearchDatabase } from '../../data/researchDatabase';

const PersonaPlanner: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string>('');

  const steps = ['Choose Your AI Planner', 'Share Your Dreams', 'Get Your Perfect Trip'];

  const handlePersonaSelect = (persona: Persona) => {
    console.log('Persona selected:', persona.name);
    setSelectedPersona(persona);
    setActiveStep(1);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setActiveStep(0);
    setSelectedPersona(null);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedStatus('Seeding research database...');
    
    try {
      const success = await seedResearchDatabase();
      if (success) {
        setSeedStatus('✅ Research database seeded successfully!');
      } else {
        setSeedStatus('❌ Failed to seed database');
      }
    } catch (error) {
      setSeedStatus(`❌ Error: ${error}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedStatus(''), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🎭 AI Persona Planner
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
          Click any conservation expert to start planning your perfect trip
        </Typography>
        
        {/* Stepper */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      {/* Persona Selection Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {personas.map((persona) => (
          <Card 
            key={persona.id}
            onClick={() => handlePersonaSelect(persona)}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <Typography variant="h1" sx={{ fontSize: '5rem', lineHeight: 1 }}>
                  {persona.emoji}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {persona.name}
                  </Typography>
                  <Typography variant="h6" color="secondary" sx={{ mb: 2 }}>
                    {persona.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                    {persona.description}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, fontSize: '1rem' }}>
                    "{persona.personality}"
                  </Typography>
                  
                  {/* Characteristics */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {persona.characteristics.focusAreas.map((area, index) => (
                      <Typography 
                        key={index}
                        variant="body2" 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText',
                          px: 2, 
                          py: 1, 
                          borderRadius: 2,
                          fontWeight: 500
                        }}
                      >
                        {area}
                      </Typography>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                    <strong>Risk tolerance:</strong> {persona.characteristics.riskTolerance} • <strong>Price range:</strong> {persona.characteristics.priceRange}
                  </Typography>
                  
                  {/* Click to chat hint */}
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: 'success.light', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                      💬 Click anywhere on this card to start chatting with {persona.name.split(' ')[0]}!
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Chat Dialog */}
      <Dialog 
        open={chatOpen}
        onClose={handleCloseChat}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '85vh', maxHeight: '900px' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '2rem' }}>
              {selectedPersona?.emoji}
            </Typography>
            <Box>
              <Typography variant="h6">
                Chat with {selectedPersona?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedPersona?.title}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseChat} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedPersona && (
            <ResearchEnabledChat 
              selectedPersona={selectedPersona}
              onTripRecommendation={(rec) => console.log('Trip recommendation:', rec)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Research Database Seeding */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ textAlign: 'center', mt: 6, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🔬 Research Database Setup
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Seed the database with verified suppliers, research metrics, and conservation data
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            sx={{ mb: 1 }}
          >
            {isSeeding ? 'Seeding...' : 'Seed Research Database'}
          </Button>
          {seedStatus && (
            <Typography variant="body2" sx={{ mt: 1, color: seedStatus.includes('✅') ? 'success.dark' : 'error.dark' }}>
              {seedStatus}
            </Typography>
          )}
        </Box>
      )}

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 8, p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Research-Powered Conservation Travel Planning
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Our AI conservation experts now have access to verified supplier databases, trust scores, ROI metrics, and real-time conservation data. Get recommendations backed by research and verified sources.
        </Typography>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🔬 Click any expert above for data-driven conservation travel recommendations!
        </Typography>
      </Box>
    </Container>
  );
};

export default PersonaPlanner;
