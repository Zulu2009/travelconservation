import React from 'react';
import { Container, Typography } from '@mui/material';

const NerdMode: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Nerd Mode
      </Typography>
      <Typography variant="body1">
        Conservation analytics dashboard coming soon...
      </Typography>
    </Container>
  );
};

export default NerdMode;
