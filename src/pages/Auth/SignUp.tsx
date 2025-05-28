import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  Container,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      setError(error.message || 'Failed to create account with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 3,
            }}
          >
            Join TravelConservation
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Create your account to start planning conservation travel with AI experts
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              backgroundColor: '#4285f4',
              '&:hover': {
                backgroundColor: '#3367d6',
              },
            }}
          >
            {loading ? 'Creating account...' : 'Sign up with Google'}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, px: 2 }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Typography>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/auth/signin')}
            sx={{ py: 1.5 }}
          >
            Sign In
          </Button>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              onClick={() => navigate('/')}
              sx={{ textDecoration: 'underline' }}
            >
              Continue as Guest
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;
