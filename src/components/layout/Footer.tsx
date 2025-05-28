import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Explore': [
      { label: 'Conservation Directory', href: '/directory' },
      { label: 'Persona Planner', href: '/persona-planner' },
      { label: 'Nerd Mode', href: '/nerd-mode' },
    ],
    'Company': [
      { label: 'About Us', href: '/about' },
      { label: 'Our Mission', href: '/mission' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Careers', href: '/careers' },
    ],
    'Support': [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedIn />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Email />, href: 'mailto:info@travelconservation.com', label: 'Email' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Brand Section */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, minWidth: 0 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                mb: 2,
              }}
            >
              TravelConservation
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, maxWidth: 300 }}>
              Connecting luxury travelers with meaningful conservation experiences 
              that protect our planet's most precious ecosystems and wildlife.
            </Typography>
            
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Box key={category} sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%', md: '1 1 25%' }, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1.1rem',
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'success.light',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} TravelConservation. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/privacy"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.8 }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.8 }}
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.8 }}
            >
              Cookies
            </Link>
          </Box>
        </Box>

        {/* Conservation Impact Statement */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            🌍 Together, we're making a difference
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Every booking through TravelConservation directly supports conservation 
            efforts and local communities protecting our planet's biodiversity.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
