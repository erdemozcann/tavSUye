import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Collapse } from '@mui/material';

interface PerformanceMonitorProps {
  isVisible?: boolean;
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Monitor navigation timing
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      const navigationMetrics: PerformanceMetric[] = [
        {
          name: 'DNS Lookup',
          startTime: timing.domainLookupStart - navigationStart,
          endTime: timing.domainLookupEnd - navigationStart,
          duration: timing.domainLookupEnd - timing.domainLookupStart,
        },
        {
          name: 'TCP Connection',
          startTime: timing.connectStart - navigationStart,
          endTime: timing.connectEnd - navigationStart,
          duration: timing.connectEnd - timing.connectStart,
        },
        {
          name: 'Request',
          startTime: timing.requestStart - navigationStart,
          endTime: timing.responseStart - navigationStart,
          duration: timing.responseStart - timing.requestStart,
        },
        {
          name: 'Response',
          startTime: timing.responseStart - navigationStart,
          endTime: timing.responseEnd - navigationStart,
          duration: timing.responseEnd - timing.responseStart,
        },
        {
          name: 'DOM Processing',
          startTime: timing.domLoading - navigationStart,
          endTime: timing.domComplete - navigationStart,
          duration: timing.domComplete - timing.domLoading,
        },
      ];
      
      setMetrics(navigationMetrics);
    }
  }, []);

  if (!isVisible) return null;

  const totalLoadTime = metrics.reduce((total, metric) => total + (metric.duration || 0), 0);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        maxWidth: 300,
        zIndex: 1000,
        boxShadow: 2,
      }}
    >
      <Box
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography variant="subtitle2">Performance Monitor</Typography>
        <Chip
          label={`${totalLoadTime}ms`}
          size="small"
          color={totalLoadTime > 3000 ? 'error' : totalLoadTime > 1000 ? 'warning' : 'success'}
        />
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 1 }}>
          {metrics.map((metric, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">{metric.name}:</Typography>
              <Typography variant="caption" fontWeight="bold">
                {metric.duration}ms
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PerformanceMonitor; 