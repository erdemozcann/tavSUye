import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const validationSchema = yup.object({
  siteName: yup.string().required('Site name is required'),
  contactEmail: yup.string().email('Enter a valid email').required('Contact email is required'),
  maxUploadSize: yup.number().min(1, 'Must be at least 1MB').required('Max upload size is required'),
  maxCommentsPerDay: yup.number().min(1, 'Must be at least 1').required('Max comments per day is required'),
});

export default function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      siteName: 'tavSUye',
      contactEmail: 'admin@tavsuye.com',
      maxUploadSize: 5,
      maxCommentsPerDay: 10,
      enableRegistration: true,
      requireEmailVerification: true,
      enable2FA: true,
      enableAnonymousComments: false,
      enableCommentModeration: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      try {
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Settings saved:', values);
        setSaveSuccess(true);
      } catch (error) {
        setSaveError('Failed to save settings. Please try again.');
        console.error('Error saving settings:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={4}>
            <Card>
              <CardHeader title="General Settings" />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    id="siteName"
                    name="siteName"
                    label="Site Name"
                    value={formik.values.siteName}
                    onChange={formik.handleChange}
                    error={formik.touched.siteName && Boolean(formik.errors.siteName)}
                    helperText={formik.touched.siteName && formik.errors.siteName}
                  />
                  
                  <TextField
                    fullWidth
                    id="contactEmail"
                    name="contactEmail"
                    label="Contact Email"
                    value={formik.values.contactEmail}
                    onChange={formik.handleChange}
                    error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                    helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Content Settings" />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    id="maxUploadSize"
                    name="maxUploadSize"
                    label="Maximum Upload Size (MB)"
                    type="number"
                    value={formik.values.maxUploadSize}
                    onChange={formik.handleChange}
                    error={formik.touched.maxUploadSize && Boolean(formik.errors.maxUploadSize)}
                    helperText={formik.touched.maxUploadSize && formik.errors.maxUploadSize}
                  />
                  
                  <TextField
                    fullWidth
                    id="maxCommentsPerDay"
                    name="maxCommentsPerDay"
                    label="Maximum Comments Per Day"
                    type="number"
                    value={formik.values.maxCommentsPerDay}
                    onChange={formik.handleChange}
                    error={formik.touched.maxCommentsPerDay && Boolean(formik.errors.maxCommentsPerDay)}
                    helperText={formik.touched.maxCommentsPerDay && formik.errors.maxCommentsPerDay}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="User Settings" />
              <CardContent>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.enableRegistration}
                        onChange={formik.handleChange}
                        name="enableRegistration"
                      />
                    }
                    label="Enable User Registration"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.requireEmailVerification}
                        onChange={formik.handleChange}
                        name="requireEmailVerification"
                      />
                    }
                    label="Require Email Verification"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.enable2FA}
                        onChange={formik.handleChange}
                        name="enable2FA"
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Comment Settings" />
              <CardContent>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.enableAnonymousComments}
                        onChange={formik.handleChange}
                        name="enableAnonymousComments"
                      />
                    }
                    label="Enable Anonymous Comments"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.enableCommentModeration}
                        onChange={formik.handleChange}
                        name="enableCommentModeration"
                      />
                    }
                    label="Enable Comment Moderation"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={isLoading}
                sx={{ minWidth: 150 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>

            {saveSuccess && (
              <Alert severity="success">Settings saved successfully!</Alert>
            )}

            {saveError && (
              <Alert severity="error">{saveError}</Alert>
            )}
          </Stack>
        </form>
      </Box>
    </Container>
  );
} 