import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  ListItemButton,
  Container,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Book,
  School,
  ArrowForward,
  Add,
  Bookmark,
  Comment,
  AccountBalance,
  BarChart,
  Person,
  Assignment,
} from '@mui/icons-material';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi, authApi, instructorApi } from '../services/api';

// Define interfaces for top visited items
interface TopVisitedCourse {
  courseId: number;
  subject: string;
  code: string;
  title: string;
  viewCount: number;
}

interface TopVisitedInstructor {
  instructorId: number;
  name: string;
  surname: string;
  viewCount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Query for top visited courses
  const { 
    data: topVisitedCourses = [], 
    isLoading: isLoadingCourses,
    error: coursesError 
  } = useQuery({
    queryKey: ['topVisitedCourses'],
    queryFn: () => courseApi.getTopVisitedCourses(),
    select: (data) => data.map((course: any) => ({
      courseId: course[0],
      subject: course[1],
      code: course[2],
      title: course[3],
      viewCount: course[4]
    })),
  });

  // Query for top visited instructors
  const { 
    data: topVisitedInstructors = [], 
    isLoading: isLoadingInstructors,
    error: instructorsError 
  } = useQuery({
    queryKey: ['topVisitedInstructors'],
    queryFn: () => instructorApi.getTopVisitedInstructors(),
    select: (data) => data.map((instructor: any) => ({
      instructorId: instructor[0],
      name: instructor[1],
      surname: instructor[2],
      viewCount: instructor[3]
    })),
  });

  const handleCourseClick = (course: TopVisitedCourse) => {
    navigate(`/courses/${course.subject}-${course.code}`);
  };

  const handleInstructorClick = (instructor: TopVisitedInstructor) => {
    navigate(`/instructors/${instructor.instructorId}`);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login'); // Redirect anyway
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      <Stack spacing={4}>
        {/* Welcome Banner */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'linear-gradient(45deg, #3f51b5 30%, #1a237e 90%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome{user?.name ? ` ${user.name}` : ''}!
              </Typography>
              <Typography variant="h6">
                Find courses, instructors and plan your academic journey
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Logged in as {user?.name && user?.surname ? `${user.name} ${user.surname}` : user?.username || 'Guest'}
              </Typography>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleLogout}
                size="small"
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>
        
        {/* Main Dashboard Content */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left Column */}
          <Box sx={{ width: { xs: '100%', md: '80%' } }}>
            <Stack spacing={3}>
              {/* Top Visited Courses */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Book sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6">Most Visited Courses</Typography>
                </Box>
                
                {isLoadingCourses ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : coursesError ? (
                  <Typography color="error">
                    Failed to load top courses. Please try again later.
                  </Typography>
                ) : (
                  <List>
                    {topVisitedCourses.map((course: TopVisitedCourse) => (
                      <ListItem 
                        key={course.courseId} 
                        disablePadding
                        divider
                      >
                        <ListItemButton onClick={() => handleCourseClick(course)}>
                          <ListItemText 
                            primary={`${course.subject} ${course.code} - ${course.title}`} 
                            secondary={`${course.viewCount} visits in the last 30 days`}
                          />
                          <ArrowForward fontSize="small" color="action" />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    
                    {topVisitedCourses.length === 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                        No course visit data available
                      </Typography>
                    )}
                  </List>
                )}
                
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/courses')}
                  >
                    All Courses
                  </Button>
                </Box>
              </Paper>

              {/* Top Visited Instructors */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6">Most Visited Instructors</Typography>
                </Box>
                
                {isLoadingInstructors ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : instructorsError ? (
                  <Typography color="error">
                    Failed to load top instructors. Please try again later.
                  </Typography>
                ) : (
                  <List>
                    {topVisitedInstructors.map((instructor: TopVisitedInstructor) => (
                      <ListItem 
                        key={instructor.instructorId} 
                        disablePadding
                        divider
                      >
                        <ListItemButton onClick={() => handleInstructorClick(instructor)}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {instructor.name.charAt(0)}
                          </Avatar>
                          <ListItemText 
                            primary={`${instructor.name} ${instructor.surname}`} 
                            secondary={`${instructor.viewCount} visits in the last 30 days`}
                          />
                          <ArrowForward fontSize="small" color="action" />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    
                    {topVisitedInstructors.length === 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                        No instructor visit data available
                      </Typography>
                    )}
                  </List>
                )}
                
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/instructors')}
                  >
                    All Instructors
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Box>
          
          {/* Right Column */}
          <Box sx={{ width: { xs: '100%', md: '20%' } }}>
            <Stack spacing={3}>
              {/* About */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  About TavSUye
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    TavSUye is a platform for Sabancı University students to view, rate, and comment on courses and instructors.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Students can plan their academic journey, share experiences, and help others make informed decisions.
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
} 