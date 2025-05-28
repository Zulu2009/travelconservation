import React from 'react';
import { Container, Typography } from '@mui/material';

const ListingDetail: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Listing Detail
      </Typography>
      <Typography variant="body1">
        Listing detail page coming soon...
      </Typography>
    </Container>
  );
};

export default ListingDetail;
