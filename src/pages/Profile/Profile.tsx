import React from 'react';
import { Container, Typography } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body1">
        User profile and dashboard coming soon...
      </Typography>
    </Container>
  );
};

export default Profile;
