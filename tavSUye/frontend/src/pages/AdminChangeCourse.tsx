import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from '@mui/material';
import {
  SwapHoriz,
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { courseApi, adminApi } from '../services/api';
import type { Course } from '../types';

export default function AdminChangeCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [oldCourseSubject, setOldCourseSubject] = useState('');
  const [oldCourseCode, setOldCourseCode] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  const [oldCourse, setOldCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Course | null>(null);

  // Fetch subjects
  const { data: subjects = [] } = useQuery<string[]>({
    queryKey: ['subjects'],
    queryFn: () => courseApi.getSubjects(),
    retry: false,
  });

  // Fetch old course codes
  const { data: oldCourseCodes = [] } = useQuery<string[]>({
    queryKey: ['course-codes', oldCourseSubject],
    queryFn: () => courseApi.getCoursesBySubject(oldCourseSubject),
    enabled: !!oldCourseSubject,
    retry: false,
  });

  // Fetch new course codes
  const { data: newCourseCodes = [] } = useQuery<string[]>({
    queryKey: ['course-codes', newCourseSubject],
    queryFn: () => courseApi.getCoursesBySubject(newCourseSubject),
    enabled: !!newCourseSubject,
    retry: false,
  });

  // Fetch old course details
  const { data: oldCourseDetails } = useQuery<Course>({
    queryKey: ['course-details', oldCourseSubject, oldCourseCode],
    queryFn: () => courseApi.getCourseDetails(oldCourseSubject, oldCourseCode),
    enabled: !!oldCourseSubject && !!oldCourseCode,
    retry: false,
  });

  // Fetch new course details
  const { data: newCourseDetails } = useQuery<Course>({
    queryKey: ['course-details', newCourseSubject, newCourseCode],
    queryFn: () => courseApi.getCourseDetails(newCourseSubject, newCourseCode),
    enabled: !!newCourseSubject && !!newCourseCode,
    retry: false,
  });

  // Update old course when data changes
  useEffect(() => {
    if (oldCourseDetails) {
      setOldCourse(oldCourseDetails);
    }
  }, [oldCourseDetails]);

  // Update new course when data changes
  useEffect(() => {
    if (newCourseDetails) {
      setNewCourse(newCourseDetails);
    }
  }, [newCourseDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!oldCourse || !newCourse) {
        throw new Error('Please select both old and new courses');
      }

      // Call the admin change course API
      const response = await adminApi.changeCourse(oldCourse.courseId, newCourse.courseId);

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/admin');
      }, 3000);

    } catch (err: any) {
      console.error('Error changing course:', err);
      setError(err.message || 'Failed to change course');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOldCourseSubject('');
    setOldCourseCode('');
    setNewCourseSubject('');
    setNewCourseCode('');
    setOldCourse(null);
    setNewCourse(null);
    setError(null);
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
          <SwapHoriz sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
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
            Change Course
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Deactivate an old course and transfer its comments to a new course.
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
          Course changed successfully! The old course has been deactivated and comments transferred. Redirecting to admin dashboard...
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
            Select Courses to Change
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Old Course Selection */}
              <Box>
                <Typography variant="h6" color="error" gutterBottom>
                  Old Course (to be deactivated)
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 2
                }}>
                  <FormControl>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={oldCourseSubject}
                      label="Subject"
                      onChange={(e) => {
                        setOldCourseSubject(e.target.value);
                        setOldCourseCode('');
                        setOldCourse(null);
                      }}
                    >
                      {subjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl disabled={!oldCourseSubject}>
                    <InputLabel>Course Code</InputLabel>
                    <Select
                      value={oldCourseCode}
                      label="Course Code"
                      onChange={(e) => {
                        setOldCourseCode(e.target.value);
                      }}
                    >
                      {oldCourseCodes.map(code => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {oldCourse && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h6">
                      {oldCourse.subject}-{oldCourse.courseCode}
                    </Typography>
                    <Typography variant="body1">
                      {oldCourse.courseNameEn || oldCourse.courseNameTr}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${oldCourse.suCredit} SU Credits`} size="small" sx={{ mr: 1 }} />
                      <Chip label={oldCourse.faculty} size="small" />
                    </Box>
                  </Card>
                )}
              </Box>

              {/* New Course Selection */}
              <Box>
                <Typography variant="h6" color="success.main" gutterBottom>
                  New Course (to receive comments)
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 2
                }}>
                  <FormControl>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={newCourseSubject}
                      label="Subject"
                      onChange={(e) => {
                        setNewCourseSubject(e.target.value);
                        setNewCourseCode('');
                        setNewCourse(null);
                      }}
                    >
                      {subjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl disabled={!newCourseSubject}>
                    <InputLabel>Course Code</InputLabel>
                    <Select
                      value={newCourseCode}
                      label="Course Code"
                      onChange={(e) => {
                        setNewCourseCode(e.target.value);
                      }}
                    >
                      {newCourseCodes.map(code => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {newCourse && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6">
                      {newCourse.subject}-{newCourse.courseCode}
                    </Typography>
                    <Typography variant="body1">
                      {newCourse.courseNameEn || newCourse.courseNameTr}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${newCourse.suCredit} SU Credits`} size="small" sx={{ mr: 1 }} />
                      <Chip label={newCourse.faculty} size="small" />
                    </Box>
                  </Card>
                )}
              </Box>

              {/* Warning */}
              {oldCourse && newCourse && (
                <Alert severity="warning">
                  <Typography variant="body1" gutterBottom>
                    <strong>Warning:</strong> This action will:
                  </Typography>
                  <ul>
                    <li>Deactivate the old course: <strong>{oldCourse.subject}-{oldCourse.courseCode}</strong></li>
                    <li>Transfer all comments from the old course to the new course: <strong>{newCourse.subject}-{newCourse.courseCode}</strong></li>
                    <li>Add "From {oldCourse.subject}-{oldCourse.courseCode}: " prefix to transferred comments</li>
                  </ul>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    This action cannot be undone.
                  </Typography>
                </Alert>
              )}

              {/* Submit Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Reset
                </Button>
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
                  disabled={loading || !oldCourse || !newCourse}
                  sx={{ minWidth: 140 }}
                  color="warning"
                >
                  {loading ? 'Changing...' : 'Change Course'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 