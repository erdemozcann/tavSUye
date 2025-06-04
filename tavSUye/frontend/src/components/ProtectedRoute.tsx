import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);

  // Add a timeout to prevent flickering for fast loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while authentication is being checked
  if (isLoading || (showLoading && !isAuthenticated)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1">Checking authentication...</Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}; 