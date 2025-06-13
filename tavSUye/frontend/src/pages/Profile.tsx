import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import apiService from '../services/api';
import type { User } from '../types';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: () => apiService.user.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (userData: Partial<User>) => {
      return apiService.user.updateProfile(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      setFormData({});
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: () => {
      console.log('Enabling 2FA...');
      return apiService.user.enable2FA();
    },
    onSuccess: (data) => {
      console.log('2FA enabled successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Failed to enable 2FA:', error);
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: () => {
      console.log('Disabling 2FA...');
      return apiService.user.disable2FA();
    },
    onSuccess: (data) => {
      console.log('2FA disabled successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Failed to disable 2FA:', error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing) {
      return;
    }
    
    // Check if we have any actual changes
    const hasChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof User];
      const profileValue = profile?.[key as keyof User];
      return formValue !== profileValue && formValue !== '';
    });
    
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }
    
    // Filter out empty values
    const filteredData: Partial<User> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        (filteredData as any)[key] = value;
      }
    });
    
    updateProfileMutation.mutate(filteredData);
  };

  const handle2FAToggle = (enabled: boolean) => {
    if (enabled) {
      enable2FAMutation.mutate();
    } else {
      disable2FAMutation.mutate();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFormData = {
      name: profile?.name || '',
      surname: profile?.surname || '',
    };
    
    setFormData(newFormData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profile?.username || ''}
                    disabled
                    helperText="Username cannot be changed"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={isEditing ? (formData.name ?? '') : (profile?.name || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    label="Surname"
                    name="surname"
                    value={isEditing ? (formData.surname ?? '') : (profile?.surname || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {isEditing ? (
                <>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelClick}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1">Two-Factor Authentication</Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={profile?.is2FAEnabled || false}
                  onChange={(e) => handle2FAToggle(e.target.checked)}
                  disabled={enable2FAMutation.isPending || disable2FAMutation.isPending}
                />
              }
              label=""
            />
          </Box>

          {(enable2FAMutation.isPending || disable2FAMutation.isPending) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Updating 2FA settings...
            </Alert>
          )}

          {enable2FAMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to enable 2FA: {enable2FAMutation.error?.message || 'Unknown error'}
            </Alert>
          )}

          {disable2FAMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to disable 2FA: {disable2FAMutation.error?.message || 'Unknown error'}
            </Alert>
          )}

          {(enable2FAMutation.isSuccess || disable2FAMutation.isSuccess) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              2FA settings updated successfully!
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 