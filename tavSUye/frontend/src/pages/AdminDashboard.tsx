import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Dashboard,
  AdminPanelSettings,
} from '@mui/icons-material';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: 'Add Course',
      description: 'Add a new course to the system',
      icon: <Add />,
      color: 'primary',
      path: '/admin/add-course'
    },
    {
      title: 'Change Course',
      description: 'Modify existing course details',
      icon: <Edit />,
      color: 'secondary',
      path: '/admin/change-course'
    },
    {
      title: 'Add Instructor',
      description: 'Add a new instructor to the system',
      icon: <Person />,
      color: 'success',
      path: '/admin/add-instructor'
    }
  ];

  return (
    <Container maxWidth="xl">
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
          <AdminPanelSettings sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
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
            Admin Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Welcome to the admin panel. Manage courses and instructors.
        </Typography>
      </Paper>

      <Stack spacing={3}>
        {/* Admin Console Section */}
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Dashboard sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Admin Console
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2 
            }}>
              {adminActions.map((action, index) => (
                <Card 
                  key={index}
                  elevation={1} 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${action.color}.main`, 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              About This System
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              This is the Sabancı University Course Feedback System admin dashboard. 
              As an administrator, you have access to essential features for managing courses and instructors.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the admin console above to add new courses and instructors, or modify existing course details.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
} 