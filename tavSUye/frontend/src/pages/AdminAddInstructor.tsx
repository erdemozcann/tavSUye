import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import {
  PersonAdd,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

export default function AdminAddInstructor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    department: '',
    imageUrl: '',
    aboutTr: '',
    aboutEn: '',
    linkTr: '',
    linkEn: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.surname || !formData.department) {
        throw new Error('Please fill in all required fields (Name, Surname, Department)');
      }

      await adminApi.addInstructor(formData);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err: any) {
      console.error('Error adding instructor:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add instructor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
          mb: 4 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonAdd sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Add New Instructor
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Add a new instructor to the system with their information.
        </Typography>
      </Paper>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin')}
          variant="outlined"
        >
          Back to Admin Dashboard
        </Button>
      </Box>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Instructor added successfully! Redirecting to admin dashboard...
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Instructor Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2 
              }}>
                <TextField
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., John"
                  required
                  helperText="First name of the instructor"
                />
                <TextField
                  label="Surname *"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  placeholder="e.g., Smith"
                  required
                  helperText="Last name of the instructor"
                />
              </Box>

              {/* Department */}
              <TextField
                label="Department *"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
                required
                fullWidth
                helperText="Department where the instructor works"
              />

              {/* Image URL */}
              <TextField
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/profile.jpg"
                fullWidth
                helperText="URL to the instructor's profile image"
              />

              {/* About Information */}
              <TextField
                label="About (Turkish)"
                value={formData.aboutTr}
                onChange={(e) => handleInputChange('aboutTr', e.target.value)}
                placeholder="Bu öğretim üyesi hakkında Türkçe bilgiler..."
                multiline
                rows={3}
                fullWidth
                helperText="Information about the instructor in Turkish"
              />
              <TextField
                label="About (English)"
                value={formData.aboutEn}
                onChange={(e) => handleInputChange('aboutEn', e.target.value)}
                placeholder="Information about this instructor in English..."
                multiline
                rows={3}
                fullWidth
                helperText="Information about the instructor in English"
              />

              {/* Links */}
              <TextField
                label="Link (Turkish)"
                value={formData.linkTr}
                onChange={(e) => handleInputChange('linkTr', e.target.value)}
                placeholder="https://example.com/tr/instructor/1"
                fullWidth
                helperText="Turkish profile page URL"
              />
              <TextField
                label="Link (English)"
                value={formData.linkEn}
                onChange={(e) => handleInputChange('linkEn', e.target.value)}
                placeholder="https://example.com/en/instructor/1"
                fullWidth
                helperText="English profile page URL"
              />

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? 'Adding...' : 'Add Instructor'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 