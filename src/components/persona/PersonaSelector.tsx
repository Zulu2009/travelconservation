import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { Persona } from '../../types';
import { PERSONAS } from '../../data/personas';

interface PersonaSelectorProps {
  onPersonaSelect: (persona: Persona) => void;
  selectedPersonaId?: string;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  onPersonaSelect,
  selectedPersonaId
}) => {
  const theme = useTheme();
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  const handlePersonaClick = (persona: Persona) => {
    onPersonaSelect(persona);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          Choose Your Conservation Expert
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Select an AI personality to guide your conservation travel planning. 
          Each expert brings unique knowledge and perspective to create your perfect trip.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: 3
        }}
      >
        {PERSONAS.map((persona, index) => (
            <Zoom key={persona.id} in timeout={300 + index * 100}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  transform: hoveredPersona === persona.id ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hoveredPersona === persona.id 
                    ? `0 12px 24px ${alpha(persona.backgroundColor, 0.3)}`
                    : theme.shadows[2],
                  border: selectedPersonaId === persona.id 
                    ? `3px solid ${persona.accentColor}`
                    : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: selectedPersonaId === persona.id
                    ? `linear-gradient(135deg, ${alpha(persona.backgroundColor, 0.1)} 0%, ${alpha(persona.accentColor, 0.05)} 100%)`
                    : 'white',
                  '&:hover': {
                    boxShadow: `0 12px 24px ${alpha(persona.backgroundColor, 0.3)}`,
                  }
                }}
                onMouseEnter={() => setHoveredPersona(persona.id)}
                onMouseLeave={() => setHoveredPersona(null)}
                onClick={() => handlePersonaClick(persona)}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Avatar and Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: persona.backgroundColor,
                        color: 'white',
                        fontSize: '1.5rem',
                        mr: 2
                      }}
                    >
                      {persona.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 'bold',
                          color: persona.backgroundColor,
                          mb: 0.5
                        }}
                      >
                        {persona.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {persona.title}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.6, flex: 1 }}
                  >
                    {persona.description}
                  </Typography>

                  {/* Expertise Tags */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1, display: 'block' }}
                    >
                      EXPERTISE
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {persona.expertise.slice(0, 3).map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: alpha(persona.backgroundColor, 0.1),
                            color: persona.backgroundColor,
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                      {persona.expertise.length > 3 && (
                        <Chip
                          label={`+${persona.expertise.length - 3} more`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Travel Style & Budget */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        STYLE
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {persona.travelStyle}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        BUDGET RANGE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${persona.budgetRange[0].toLocaleString()} - ${persona.budgetRange[1].toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Risk Tolerance */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ADVENTURE LEVEL
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {[1, 2, 3].map((level) => (
                        <Box
                          key={level}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: level <= (persona.riskTolerance === 'low' ? 1 : persona.riskTolerance === 'medium' ? 2 : 3)
                              ? persona.accentColor
                              : alpha(theme.palette.divider, 0.3),
                            mr: 0.5
                          }}
                        />
                      ))}
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, textTransform: 'capitalize', fontWeight: 500 }}
                      >
                        {persona.riskTolerance}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Select Button */}
                  <Fade in={hoveredPersona === persona.id || selectedPersonaId === persona.id}>
                    <Button
                      variant={selectedPersonaId === persona.id ? "contained" : "outlined"}
                      fullWidth
                      sx={{
                        mt: 'auto',
                        backgroundColor: selectedPersonaId === persona.id ? persona.backgroundColor : 'transparent',
                        borderColor: persona.backgroundColor,
                        color: selectedPersonaId === persona.id ? 'white' : persona.backgroundColor,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: persona.backgroundColor,
                          color: 'white',
                        }
                      }}
                    >
                      {selectedPersonaId === persona.id ? 'Selected' : 'Choose This Expert'}
                    </Button>
                  </Fade>
                </CardContent>
              </Card>
            </Zoom>
        ))}
      </Box>

      {selectedPersonaId && (
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Great choice! Ready to start planning?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your selected expert will guide you through creating the perfect conservation travel experience.
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default PersonaSelector;
