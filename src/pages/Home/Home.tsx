import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Explore,
  Psychology,
  Analytics,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const featuredDestinations = [
    {
      id: '1',
      name: 'Maasai Mara Wildlife Conservancy',
      location: 'Kenya',
      type: 'Wildlife',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      description: 'Experience the Great Migration while supporting local conservation efforts.',
      luxuryLevel: 5,
      sustainabilityScore: 95,
    },
    {
      id: '2',
      name: 'Galápagos Eco Lodge',
      location: 'Ecuador',
      type: 'Marine',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      description: 'Luxury eco-lodge supporting marine conservation research.',
      luxuryLevel: 4,
      sustainabilityScore: 98,
    },
    {
      id: '3',
      name: 'Amazon Rainforest Reserve',
      location: 'Brazil',
      type: 'Forest',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      description: 'Immerse yourself in pristine rainforest while protecting biodiversity.',
      luxuryLevel: 3,
      sustainabilityScore: 92,
    },
  ];

  const impactStats = [
    { label: 'Conservation Projects Supported', value: '150+' },
    { label: 'Wildlife Protected', value: '50,000+' },
    { label: 'Carbon Offset (tons)', value: '25,000+' },
    { label: 'Local Communities Supported', value: '75+' },
  ];

  const features = [
    {
      icon: <Explore sx={{ fontSize: 48 }} />,
      title: 'Curated Directory',
      description: 'Discover hand-picked luxury conservation experiences worldwide.',
      action: () => navigate('/directory'),
    },
    {
      icon: <Psychology sx={{ fontSize: 48 }} />,
      title: 'Persona Planner',
      description: 'AI-powered trip planning based on your conservation interests.',
      action: () => navigate('/persona-planner'),
    },
    {
      icon: <Analytics sx={{ fontSize: 48 }} />,
      title: 'Nerd Mode',
      description: 'Deep dive into conservation analytics and impact data.',
      action: () => navigate('/nerd-mode'),
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D5A47 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Luxury Travel That
                <Box component="span" sx={{ color: 'success.light', display: 'block' }}>
                  Protects Our Planet
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                Discover extraordinary conservation experiences that combine luxury 
                travel with meaningful environmental impact.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/directory')}
                  sx={{
                    backgroundColor: 'success.main',
                    '&:hover': { backgroundColor: 'success.dark' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Explore Directory
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/persona-planner')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'success.light',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Plan Your Trip
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
                  alt="Conservation Travel"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Impact Stats */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Our Conservation Impact
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {impactStats.map((stat, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' }, minWidth: 0 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Featured Destinations */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Featured Conservation Destinations
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Handpicked luxury experiences that make a real difference for wildlife and communities
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {featuredDestinations.map((destination) => (
              <Box key={destination.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 0 }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  onClick={() => navigate(`/directory/${destination.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={destination.image}
                    alt={destination.name}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={destination.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${destination.sustainabilityScore}% Sustainable`}
                        size="small"
                        color="success"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {destination.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {destination.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {destination.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {Array.from({ length: destination.luxuryLevel }).map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'warning.main',
                            }}
                          />
                        ))}
                      </Box>
                      <ArrowForward sx={{ color: 'primary.main' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Discover Your Perfect Conservation Journey
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 0 }}>
                <Card
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={feature.action}
                >
                  <Box sx={{ color: 'primary.main', mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={feature.action}
                  >
                    Learn More
                  </Button>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #52B788 0%, #1B4332 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of conscious travelers creating positive impact 
              through luxury conservation experiences.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/directory')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
