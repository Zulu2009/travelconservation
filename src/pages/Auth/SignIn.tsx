import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  Container,
  Chip,
} from '@mui/material';
import { Google as GoogleIcon, Info as InfoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Attempting Google sign-in...');
      console.log('Current domain:', window.location.hostname);
      console.log('Current URL:', window.location.href);
      
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Set debug info for development
      setDebugInfo(`Domain: ${window.location.hostname} | Code: ${error.code}`);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/unauthorized-domain') {
        setError(`Domain "${window.location.hostname}" is not authorized. This is a configuration issue that needs to be fixed in Firebase Console.`);
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please enable pop-ups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in with Google');
      }
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
            Welcome Back
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Sign in to access your conservation travel planning with AI experts
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
            onClick={handleGoogleSignIn}
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
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New to TravelConservation?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/auth/signup')}
            sx={{ py: 1.5 }}
          >
            Create Account
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

export default SignIn;
