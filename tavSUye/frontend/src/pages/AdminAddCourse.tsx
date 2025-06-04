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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

export default function AdminAddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    courseCode: '',
    courseNameEn: '',
    courseNameTr: '',
    suCredit: 0,
    ectsCredit: 0,
    engineeringEcts: 0,
    basicScienceEcts: 0,
    contentEn: '',
    contentTr: '',
    linkEn: '',
    linkTr: '',
    faculty: '' as 'FASS' | 'FMAN' | 'FENS' | 'SL' | '',
    courseStatus: true
  });

  const faculties = ['FASS', 'FMAN', 'FENS', 'SL'];

  const handleInputChange = (field: string, value: any) => {
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
      if (!formData.subject || !formData.courseCode || !formData.courseNameEn || !formData.faculty) {
        throw new Error('Please fill in all required fields');
      }

      // Convert numeric fields and filter out empty faculty
      const courseData = {
        ...formData,
        suCredit: Number(formData.suCredit),
        ectsCredit: Number(formData.ectsCredit),
        engineeringEcts: Number(formData.engineeringEcts),
        basicScienceEcts: Number(formData.basicScienceEcts),
        faculty: formData.faculty || undefined
      };

      await adminApi.addCourse(courseData);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err: any) {
      console.error('Error adding course:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add course');
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
          <Add sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
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
            Add New Course
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Add a new course to the system with all required information.
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
          Course added successfully! Redirecting to admin dashboard...
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
            Course Information
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
                  label="Subject *"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., CS"
                  required
                  helperText="Course subject code (e.g., CS, MATH, EE)"
                />
                <TextField
                  label="Course Code *"
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange('courseCode', e.target.value)}
                  placeholder="e.g., 103"
                  required
                  helperText="Numeric course code"
                />
              </Box>

              {/* Course Names */}
              <TextField
                label="Course Name (English) *"
                value={formData.courseNameEn}
                onChange={(e) => handleInputChange('courseNameEn', e.target.value)}
                placeholder="e.g., Data Structures"
                required
                fullWidth
              />
              <TextField
                label="Course Name (Turkish)"
                value={formData.courseNameTr}
                onChange={(e) => handleInputChange('courseNameTr', e.target.value)}
                placeholder="e.g., Veri Yapıları"
                fullWidth
              />

              {/* Credits */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                gap: 2 
              }}>
                <TextField
                  label="SU Credit"
                  type="number"
                  value={formData.suCredit}
                  onChange={(e) => handleInputChange('suCredit', e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
                <TextField
                  label="ECTS Credit"
                  type="number"
                  value={formData.ectsCredit}
                  onChange={(e) => handleInputChange('ectsCredit', e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
                <TextField
                  label="Engineering ECTS"
                  type="number"
                  value={formData.engineeringEcts}
                  onChange={(e) => handleInputChange('engineeringEcts', e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
                <TextField
                  label="Basic Science ECTS"
                  type="number"
                  value={formData.basicScienceEcts}
                  onChange={(e) => handleInputChange('basicScienceEcts', e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </Box>

              {/* Content */}
              <TextField
                label="Content (English)"
                value={formData.contentEn}
                onChange={(e) => handleInputChange('contentEn', e.target.value)}
                placeholder="This course covers..."
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Content (Turkish)"
                value={formData.contentTr}
                onChange={(e) => handleInputChange('contentTr', e.target.value)}
                placeholder="Bu ders kapsar..."
                multiline
                rows={3}
                fullWidth
              />

              {/* Links */}
              <TextField
                label="Link (English)"
                value={formData.linkEn}
                onChange={(e) => handleInputChange('linkEn', e.target.value)}
                placeholder="http://example.com/course"
                fullWidth
              />
              <TextField
                label="Link (Turkish)"
                value={formData.linkTr}
                onChange={(e) => handleInputChange('linkTr', e.target.value)}
                placeholder="http://example.com/course-tr"
                fullWidth
              />

              {/* Faculty and Status */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2,
                alignItems: 'center'
              }}>
                <FormControl required>
                  <InputLabel>Faculty *</InputLabel>
                  <Select
                    value={formData.faculty}
                    label="Faculty *"
                    onChange={(e) => handleInputChange('faculty', e.target.value as 'FASS' | 'FMAN' | 'FENS' | 'SL' | '')}
                  >
                    {faculties.map(faculty => (
                      <MenuItem key={faculty} value={faculty}>
                        {faculty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.courseStatus}
                      onChange={(e) => handleInputChange('courseStatus', e.target.checked)}
                    />
                  }
                  label="Course Active"
                />
              </Box>

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
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Adding...' : 'Add Course'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 