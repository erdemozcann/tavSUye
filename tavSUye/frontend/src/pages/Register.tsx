import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authApi } from '../services/api';
import { setError } from '../store/slices/authSlice';

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required')
    .matches(/@sabanciuniv\.edu$/, 'Only Sabancı University email addresses are allowed'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setDebugInfo(null);
      try {
        // Create registration request with both naming conventions
        const registrationData = {
          firstName: values.firstName,
          lastName: values.lastName,
          name: values.firstName, // Backend expects name/surname as well
          surname: values.lastName, // Backend expects name/surname as well
          username: values.username,
          email: values.email,
          password: values.password,
        };
        
        console.log('Attempting registration with data:', JSON.stringify(registrationData, null, 2));
        
        try {
          const response = await authApi.register(registrationData);
          setDebugInfo(JSON.stringify(response, null, 2));
          setSuccess(true);
          
          // Redirect to email verification page
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
          }, 3000);
        } catch (apiError: any) {
          console.error('Registration API error details:', apiError);
          
          let errorMessage = "Registration failed. Please try again.";
          
          if (apiError.response) {
            const status = apiError.response.status;
            const responseData = apiError.response.data;
            
            setDebugInfo(JSON.stringify({
              status: status,
              data: responseData,
              headers: apiError.response.headers
            }, null, 2));
            
            // Special handling for verification code already sent
            if (status === 400 || status === 409) {
              if (typeof responseData === 'string' && 
                  (responseData.includes("Please verify your email") || 
                   responseData.includes("User already exists"))) {
                // Show success message and redirect to email verification page
                setSuccess(true);
                setTimeout(() => {
                  navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
                }, 2000);
                return;
              }
            }
            
            // Handle specific error status codes
            if (status === 401) {
              errorMessage = "Authentication error. Please try again.";
            } else if (status === 403) {
              errorMessage = "Only Sabancı University email addresses are allowed.";
            } else if (status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else {
              errorMessage = responseData || `Registration failed (${status})`;
            }
          } else if (apiError.request) {
            setDebugInfo(JSON.stringify({
              message: "No response received from server",
              request: "Request was sent but no response received"
            }, null, 2));
            errorMessage = "Network error: Unable to connect to the server.";
          } else {
            setDebugInfo(JSON.stringify({
              message: apiError.message || "Unknown error occurred"
            }, null, 2));
          }
          
          dispatch(setError(errorMessage));
        }
      } catch (error: any) {
        console.error("Unhandled registration error:", error);
        dispatch(setError("An unexpected error occurred during registration."));
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
            }}
          >
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Registration successful! Please check your email for verification.
            </Alert>
            <Typography variant="body1" align="center">
              Redirecting to email verification page...
            </Typography>
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
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
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
          
          <Typography component="h1" variant="h5">
            Create your account
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Stack>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 1 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
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