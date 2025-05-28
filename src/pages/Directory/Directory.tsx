import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const Directory: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Conservation Directory
      </Typography>
      <Typography variant="body1">
        Directory page coming soon...
      </Typography>
    </Container>
  );
};

export default Directory;
