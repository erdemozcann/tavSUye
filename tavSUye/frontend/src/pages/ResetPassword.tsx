import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  code: yup
    .string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Code must be a 6-digit number'),
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

export default function ResetPassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const { resetPassword, isLoading } = useAuth();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      email: emailFromUrl || '',
      code: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      
      try {
        // Use AuthContext resetPassword which handles redirect to login page
        await resetPassword(values.email, values.code, values.password);
        setSuccess(true);
      } catch (error: any) {
        console.error("Password reset error:", error);
        
        let errorMessage = "Failed to reset password. Please try again.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response?.data === 'string') {
          if (error.response.data.includes("expired")) {
            errorMessage = "The password reset code has expired. Please request a new code.";
          } else if (error.response.data.includes("Invalid")) {
            errorMessage = "Invalid reset code. Please check and try again.";
          } else {
            errorMessage = error.response.data;
          }
        } else if (error.response?.status === 400) {
          errorMessage = "Invalid reset code or password requirements not met.";
        }
        
        setError(errorMessage);
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
              Your password has been reset successfully!
            </Alert>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              You can now log in with your new password.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login page...
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
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Reset Password
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your email, the verification code sent to you, and your new password.
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isLoading || Boolean(emailFromUrl)}
              />

              <TextField
                fullWidth
                id="code"
                name="code"
                label="Verification Code"
                value={formik.values.code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  formik.setFieldValue('code', value);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={isLoading}
                placeholder="Enter 6-digit code"
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric',
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !formik.isValid}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Reset Password'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Login
                </Link>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 