import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, LinearProgress, Alert, AlertTitle } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { API_URL } from '../config';
import axios from 'axios';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'success' | 'error' | 'loading';
  error?: string;
  statusCode?: number;
}

const ApiStatusBar: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'health', url: `${API_URL}/health`, status: 'loading' },
    { name: 'courses', url: `${API_URL}/courses/all`, status: 'loading' },
    { name: 'instructors', url: `${API_URL}/instructors/all`, status: 'loading' },
    { name: 'programs', url: `${API_URL}/programs/all`, status: 'loading' },
  ]);

  useEffect(() => {
    const checkEndpoints = async () => {
      const updatedEndpoints = [...endpoints];
      
      for (let i = 0; i < updatedEndpoints.length; i++) {
        const endpoint = updatedEndpoints[i];
        try {
          const response = await axios.get(endpoint.url, { timeout: 5000 });
          updatedEndpoints[i] = {
            ...endpoint,
            status: 'success',
            statusCode: response.status
          };
        } catch (error: any) {
          updatedEndpoints[i] = {
            ...endpoint,
            status: 'error',
            error: error.message,
            statusCode: error.response?.status
          };
        }
      }
      
      setEndpoints(updatedEndpoints);
    };

    checkEndpoints();
  }, []);

  const getWorkingEndpointsCount = () => {
    return endpoints.filter(e => e.status === 'success').length;
  };

  const allLoading = endpoints.every(e => e.status === 'loading');
  const totalEndpoints = endpoints.length;
  const workingEndpoints = getWorkingEndpointsCount();

  if (allLoading) {
    return <LinearProgress sx={{ width: '100%', mb: 2 }} />;
  }

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert 
        severity={workingEndpoints === totalEndpoints ? "success" : workingEndpoints > 0 ? "warning" : "error"}
        sx={{ mb: 1 }}
      >
        <AlertTitle>
          {workingEndpoints === totalEndpoints ? "All Systems Operational" : 
           workingEndpoints > 0 ? "Partial Service Disruption" : "Service Unavailable"}
        </AlertTitle>
        <Typography>
          {workingEndpoints} of {totalEndpoints} endpoints available
        </Typography>
      </Alert>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {endpoints.map((endpoint) => (
          <Chip
            key={endpoint.name}
            label={`${endpoint.name}: ${endpoint.status === 'success' ? 'OK' : endpoint.statusCode || 'Error'}`}
            color={endpoint.status === 'success' ? 'success' : 'error'}
            icon={endpoint.status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
};

export default ApiStatusBar; 