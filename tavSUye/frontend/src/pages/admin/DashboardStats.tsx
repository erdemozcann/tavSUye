import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Group as GroupIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// Mock data for statistics
const mockStats = {
  totalUsers: 1254,
  activeUsers: 876,
  totalCourses: 328,
  totalInstructors: 142,
  totalComments: 4567,
  totalReviews: 2845,
  totalViews: 25689,
  averageRating: 4.2,
  usersByMonth: [120, 145, 160, 178, 190, 210, 230, 245, 260, 275, 290, 310],
  commentsByMonth: [350, 420, 380, 410, 450, 470, 510, 490, 520, 550, 580, 610],
  viewsByMonth: [1800, 2100, 2300, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000],
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              backgroundColor: `${color}20`, 
              borderRadius: '50%', 
              p: 1, 
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  // In a real implementation, this would be an API call
  const { data: stats = mockStats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => Promise.resolve(mockStats),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Statistics
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Platform Overview
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
              gap: 2,
            }}
          >
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers.toLocaleString()} 
              icon={<GroupIcon fontSize="large" />} 
              color="#1976d2" 
            />
            <StatCard 
              title="Active Users" 
              value={stats.activeUsers.toLocaleString()} 
              icon={<GroupIcon fontSize="large" />} 
              color="#2e7d32" 
            />
            <StatCard 
              title="Total Courses" 
              value={stats.totalCourses.toLocaleString()} 
              icon={<SchoolIcon fontSize="large" />} 
              color="#ed6c02" 
            />
            <StatCard 
              title="Total Instructors" 
              value={stats.totalInstructors.toLocaleString()} 
              icon={<PersonIcon fontSize="large" />} 
              color="#9c27b0" 
            />
          </Stack>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Engagement Metrics
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
              gap: 2,
            }}
          >
            <StatCard 
              title="Total Comments" 
              value={stats.totalComments.toLocaleString()} 
              icon={<CommentIcon fontSize="large" />} 
              color="#0288d1" 
            />
            <StatCard 
              title="Total Reviews" 
              value={stats.totalReviews.toLocaleString()} 
              icon={<StarIcon fontSize="large" />} 
              color="#f44336" 
            />
            <StatCard 
              title="Total Views" 
              value={stats.totalViews.toLocaleString()} 
              icon={<VisibilityIcon fontSize="large" />} 
              color="#009688" 
            />
            <StatCard 
              title="Average Rating" 
              value={stats.averageRating.toFixed(1) + ' / 5'} 
              icon={<StarIcon fontSize="large" />} 
              color="#ffc107" 
            />
          </Stack>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Growth (Last 12 Months)
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                This chart would display the monthly growth trends for users, comments, and views.
                In a real implementation, this would be a chart component (e.g., using Chart.js, Recharts, or Nivo).
              </Typography>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Chart placeholder - Monthly growth data
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 