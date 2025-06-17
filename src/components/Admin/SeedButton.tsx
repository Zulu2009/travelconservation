import React from 'react';
import { Button } from '@mui/material';
import { seedDatabase } from '../../utils/seedDatabase';

const SeedButton: React.FC = () => {
  const handleSeed = async () => {
    if (window.confirm('This will add sample data to your database. Continue?')) {
      await seedDatabase();
      alert('Database seeded successfully! Check your Firestore console.');
    }
  };

  return (
    <Button 
      variant="contained" 
      color="warning" 
      onClick={handleSeed}
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000,
        fontSize: '12px',
        minWidth: 'auto',
        px: 2
      }}
    >
      🌱 Seed DB
    </Button>
  );
};

export default SeedButton;
