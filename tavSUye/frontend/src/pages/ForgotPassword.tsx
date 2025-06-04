import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material';
import { authApi } from '../services/api';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required')
    .matches(/@sabanciuniv\.edu$/, 'Only Sabancı University email addresses are allowed'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      try {
        const response = await authApi.forgotPassword(values.email);
        
        // Handle case when code was already sent
        if (response?.codeAlreadySent) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = `/reset-password?email=${encodeURIComponent(values.email)}`;
          }, 2000);
          return;
        }
        
        setDebugInfo(JSON.stringify(response, null, 2));
        setSuccess(true);
      } catch (error: any) {
        console.error("Password reset error:", error);
        
        let errorMessage = "An unexpected error occurred. Please try again.";
        
        if (error.response) {
          setDebugInfo(JSON.stringify({
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          }, null, 2));
          
          errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : error.response.data?.message || 
              `Failed to request password reset (${error.response.status})`;
        } else if (error.request) {
          setDebugInfo(JSON.stringify({
            message: "No response received from server",
            request: "Request was sent but no response received"
          }, null, 2));
          
          errorMessage = "Network error: Unable to connect to the server.";
        } else {
          setDebugInfo(JSON.stringify({
            message: error.message || "Unknown error occurred"
          }, null, 2));
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 2,
            }}
          >
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Password reset instructions have been sent to your email.
            </Alert>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Please check your inbox for an email with a 6-digit verification code. You will need to enter this code along with your new password on the reset password page.
            </Typography>
            <Link component={RouterLink} to="/reset-password" variant="body2">
              Go to reset password page
            </Link>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address and we'll send you a verification code to reset your password. You will need this code in the next step.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to login
                </Link>
              </Box>
            </Stack>
          </Box>
          
          {debugInfo && (
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>Debug Information:</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem'
                }}
              >
                {debugInfo}
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 