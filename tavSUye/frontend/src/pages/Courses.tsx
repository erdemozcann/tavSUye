import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { SelectChangeEvent } from '@mui/material';
import {
  Container,
  Stack,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  MenuBook,
} from '@mui/icons-material';
import { courseApi, getForceRealBackend } from '../services/api';

export default function Courses() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
  const navigate = useNavigate();
  const isDemoMode = localStorage.getItem('demo_user_mode') === 'true';
  const forceRealBackend = getForceRealBackend();

  // Fetch subjects
  const { 
    data: subjects = [], 
    isLoading: isLoadingSubjects,
    error: subjectsError 
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => courseApi.getSubjects(),
  });

  // Fetch course codes for selected subject
  const { 
    data: courseCodes = [], 
    isLoading: isLoadingCourseCodes,
    error: courseCodesError 
  } = useQuery({
    queryKey: ['courseCodes', selectedSubject],
    queryFn: () => courseApi.getCoursesBySubject(selectedSubject),
    enabled: !!selectedSubject, // Only run query when a subject is selected
  });

  const handleSubjectChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedSubject(value);
    setSelectedCourseCode(''); // Reset course code selection when subject changes
  };

  const handleCourseCodeSelect = (courseCode: string) => {
    setSelectedCourseCode(courseCode);
    navigate(`/courses/${selectedSubject}-${courseCode}`);
  };

  // Render loading state for the entire page
  if (isLoadingSubjects) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%', my: 4 }}>
          <LinearProgress />
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Loading subjects...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Render error state
  if (subjectsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading subjects: {(subjectsError as Error)?.message || "Unknown error"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <MenuBook sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
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
            Course Selection
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Select a subject and course code to view course details and reviews.
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Subject Selection */}
        <Box sx={{ width: { xs: '100%', md: '300px' }}}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Step 1: Select a Subject
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                id="subject-select"
                value={selectedSubject}
                onChange={handleSubjectChange}
                label="Subject"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      width: 150,
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select a subject</em>
                </MenuItem>
                {subjects.map((subject: string) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>

        {/* Course Codes */}
        <Box sx={{ width: { xs: '100%', md: 'calc(100% - 320px)' }}}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Step 2: Select a Course Code
            </Typography>
            
            {!selectedSubject && (
              <Alert severity="info">
                Please select a subject first.
              </Alert>
            )}

            {selectedSubject && isLoadingCourseCodes && (
              <Box sx={{ width: '100%', my: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Loading course codes...
                </Typography>
              </Box>
            )}

            {selectedSubject && courseCodesError && (
              <Alert severity="error" sx={{ my: 2 }}>
                Error loading course codes: {(courseCodesError as Error)?.message || "Unknown error"}
              </Alert>
            )}

            {selectedSubject && !isLoadingCourseCodes && courseCodes.length === 0 && (
              <Alert severity="info">
                No course codes found for {selectedSubject}.
              </Alert>
            )}

            {selectedSubject && !isLoadingCourseCodes && courseCodes.length > 0 && (
              <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'background.paper' }}>
                {courseCodes.map((courseCode: string) => (
                  <ListItem 
                    disablePadding 
                    key={courseCode}
                    divider
                  >
                    <ListItemButton 
                      onClick={() => handleCourseCodeSelect(courseCode)}
                      selected={courseCode === selectedCourseCode}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.main',
                          },
                        },
                      }}
                    >
                      <ListItemText 
                        primary={`${selectedSubject} ${courseCode}`} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
} 