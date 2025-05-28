import React, { useState } from 'react';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, Fade } from '@mui/material';
import PersonaSelector from '../../components/persona/PersonaSelector';
import PersonaChat from '../../components/persona/PersonaChat';
import { Persona } from '../../types';

const PersonaPlanner: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [tripPlan, setTripPlan] = useState(null);

  const steps = [
    'Choose Your Expert',
    'Plan Your Trip',
    'Review & Book'
  ];

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handleStartPlanning = () => {
    if (selectedPersona) {
      setActiveStep(1);
    }
  };

  const handleTripPlanGenerated = (plan: any) => {
    setTripPlan(plan);
    setActiveStep(2);
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <PersonaSelector
                onPersonaSelect={handlePersonaSelect}
                selectedPersonaId={selectedPersona?.id}
              />
              {selectedPersona && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartPlanning}
                    sx={{
                      backgroundColor: selectedPersona.backgroundColor,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: selectedPersona.backgroundColor,
                        opacity: 0.9
                      }
                    }}
                  >
                    Start Planning with {selectedPersona.name}
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in timeout={500}>
            <Box sx={{ height: 'calc(100vh - 200px)' }}>
              {selectedPersona && (
                <PersonaChat
                  personaId={selectedPersona.id}
                  onTripPlanGenerated={handleTripPlanGenerated}
                />
              )}
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" gutterBottom>
                🎉 Your Trip Plan is Ready!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Review your personalized conservation travel experience
              </Typography>
              {/* Trip plan details would go here */}
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ mr: 2 }}
              >
                Back to Chat
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
              >
                Book This Trip
              </Button>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B4332 0%, #52B788 100%)',
          color: 'white',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}
          >
            🎭 AI Persona Planner
          </Typography>
          <Typography
            variant="h6"
            sx={{ textAlign: 'center', opacity: 0.9, mb: 4 }}
          >
            Chat with conservation experts to plan your perfect trip
          </Typography>
          
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mt: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'white',
                      opacity: 0.8
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: 'white',
                      opacity: 1,
                      fontWeight: 'bold'
                    },
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                      color: 'white'
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: '#52B788'
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth={activeStep === 1 ? false : "lg"} sx={{ py: activeStep === 1 ? 0 : 4 }}>
        {renderStepContent()}
      </Container>
    </Box>
  );
};

export default PersonaPlanner;
