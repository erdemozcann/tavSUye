import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiService from '../services/api';

const Settings: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: apiService.user.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: apiService.user.updateProfile,
    onSuccess: () => {
      setShowSuccess(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update profile');
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: apiService.user.enable2FA,
    onSuccess: () => {
      setShowSuccess(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to enable 2FA');
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: apiService.user.disable2FA,
    onSuccess: () => {
      setShowSuccess(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to disable 2FA');
    },
  });

  const handle2FAToggle = () => {
    if (user) {
      if (user.is2FAEnabled) {
        disable2FAMutation.mutate();
      } else {
        enable2FAMutation.mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="error">User not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              value={user.email}
              disabled
              margin="normal"
            />
            <TextField
              fullWidth
              label="Username"
              value={user.username}
              disabled
              margin="normal"
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={user.is2FAEnabled}
                onChange={handle2FAToggle}
                disabled={enable2FAMutation.isPending || disable2FAMutation.isPending}
              />
            }
            label="Two-Factor Authentication"
          />
          {enable2FAMutation.isPending || disable2FAMutation.isPending ? (
            <CircularProgress size={24} sx={{ ml: 2 }} />
          ) : null}
        </Paper>

        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Settings updated successfully
          </Alert>
        </Snackbar>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Settings; 