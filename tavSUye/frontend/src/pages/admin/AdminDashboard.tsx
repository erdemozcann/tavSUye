import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface AdminFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

function AdminFeatureCard({ title, description, icon, path }: AdminFeatureCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea 
        sx={{ height: '100%', p: 2 }}
        onClick={() => navigate(path)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const isRootPath = location.pathname === '/admin';
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1">
            Welcome to the tavSUye Admin Dashboard. Here you can manage courses, instructors, users, and monitor the platform.
          </Typography>
        </Paper>

        {isRootPath ? (
          <Box sx={{ mt: 4 }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="Course Management"
                    description="Add, edit, and manage courses in the system"
                    icon={<SchoolIcon fontSize="large" color="primary" />}
                    path="/admin/courses"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="Instructor Management"
                    description="Add, edit, and manage instructors"
                    icon={<PersonIcon fontSize="large" color="primary" />}
                    path="/admin/instructors"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="User Management"
                    description="View and manage user accounts"
                    icon={<GroupIcon fontSize="large" color="primary" />}
                    path="/admin/users"
                  />
                </Box>
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="Comment Moderation"
                    description="Review and moderate user comments"
                    icon={<CommentIcon fontSize="large" color="primary" />}
                    path="/admin/comments"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="System Settings"
                    description="Configure system settings and parameters"
                    icon={<SettingsIcon fontSize="large" color="primary" />}
                    path="/admin/settings"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <AdminFeatureCard
                    title="Dashboard"
                    description="View platform statistics and analytics"
                    icon={<DashboardIcon fontSize="large" color="primary" />}
                    path="/admin/stats"
                  />
                </Box>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Outlet />
        )}
      </Box>
    </Container>
  );
} 