import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

// Helper: decide if a user matches required role (admin etc.)
const hasRequiredRole = (userRole?: string, requiredRole?: string) => {
  if (!requiredRole) return true; // no role required
  if (!userRole) return false;
  // Simple equality for now; can be expanded to role hierarchies later
  return userRole.toUpperCase() === requiredRole.toUpperCase();
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Simple loading indicator without any redirects
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role
  if (!hasRequiredRole(user?.role, requireRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 