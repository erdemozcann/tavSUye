import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { RootState } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [displayEmail, setDisplayEmail] = useState<string>(''); // For showing to user
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const navigate = useNavigate();
  const { verify2FA, isLoading } = useAuth();

  useEffect(() => {
    // Get the stored email/username from login
    const storedEmail = localStorage.getItem('2fa_email');
    const storedUsername = localStorage.getItem('2fa_username');
    
    if (storedEmail) {
      setEmail(storedEmail);
      
      // Check if the stored value is an email or username
      if (storedEmail.includes('@')) {
        // It's an email, use it directly
        setDisplayEmail(storedEmail);
      } else {
        // It's a username, we need to get the actual email for display
        setDisplayEmail(storedEmail); // Show username initially
        fetchUserEmail(storedEmail);
      }
    } else {
      // If no email found, redirect back to login
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserEmail = async (username: string) => {
    setIsLoadingEmail(true);
    try {
      // Try to get user profile to get their email
      const profile = await authApi.getProfile();
      if (profile && profile.email) {
        setDisplayEmail(profile.email);
        setEmail(profile.email); // Use actual email for verification
      } else {
        // If we can't get the email, show a generic message
        setDisplayEmail('your registered email address');
      }
    } catch (error) {
      console.warn('Could not fetch user email for display:', error);
      // Show a generic message if we can't get the email
      setDisplayEmail('your registered email address');
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError(null);

    try {
      // Use the email we determined (either from direct email login or fetched from profile)
      await verify2FA(email, code);
    } catch (error: any) {
      console.error("2FA verification error:", error);
      
      let errorMessage = "Invalid verification code. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid verification code";
      } else if (error.response?.status === 401) {
        errorMessage = "Verification code expired. Please login again.";
      }
      
      setError(errorMessage);
    }
  };

  if (!email) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Email is required for 2FA verification. Please try logging in again.
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img 
                src="/tavsuye_logo.jpeg" 
                alt="tavSUye" 
                style={{ 
                  height: '60px', 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom align="center">
              Two-Factor Authentication
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center">
              {isLoadingEmail ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <span>Loading...</span>
                </Box>
              ) : (
                `Please enter the verification code sent to: ${displayEmail}`
              )}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading || isLoadingEmail}
                  placeholder="Enter 6-digit code"
                  inputProps={{
                    maxLength: 6,
                    pattern: '[0-9]*',
                    inputMode: 'numeric',
                  }}
                />

                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading || code.length !== 6 || isLoadingEmail}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Verify'
                  )}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
} 