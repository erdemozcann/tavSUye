import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Unauthorized Access
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            You do not have permission to access this page. Please contact an administrator if you believe this is an error.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Go to Home
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 