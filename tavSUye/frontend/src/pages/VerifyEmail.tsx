import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { verifyEmail, isLoading } = useAuth();

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
      // Use AuthContext verifyEmail which handles redirect to login page
      await verifyEmail(email, code);
      setSuccess(true);
    } catch (error: any) {
      console.error("Email verification error:", error);
      
      let errorMessage = "Invalid verification code. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        if (error.response.data.includes("expired")) {
          errorMessage = "The verification code has expired. Please register again to get a new code.";
        } else if (error.response.data.includes("Invalid")) {
          errorMessage = "Invalid verification code. Please check and try again.";
        } else {
          errorMessage = error.response.data;
        }
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid verification code";
      }
      
      setError(errorMessage);
    }
  };

  if (!email) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Email is required for verification. Please check your email for the verification link.
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/register')}>
              Back to Register
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (success) {
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
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              Email verified successfully!
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Redirecting to login page...
            </Typography>
          </Paper>
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
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Verify Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center">
              Please enter the verification code sent to {email}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
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
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/register')}
                  disabled={isLoading}
                >
                  Back to Register
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
} 