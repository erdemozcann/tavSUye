import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Stack,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person,
  Star,
  StarBorder,
  FilterList,
  ExpandMore,
  School,
  ArrowForward,
} from '@mui/icons-material';
import { instructorApi } from '../services/api';
import type { Instructor } from '../types';

export default function Instructors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('nameAsc');
  const navigate = useNavigate();

  const { data: instructors = [], isLoading, error } = useQuery<Instructor[]>({
    queryKey: ['instructors', 'v2'],
    queryFn: () => instructorApi.getAllInstructors(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  // Debug logging
  console.log('Instructors page - isLoading:', isLoading, 'error:', error, 'instructors count:', instructors.length);
  if (instructors.length > 0) {
    console.log('First instructor:', instructors[0]);
    console.log('First instructor imageUrl:', instructors[0].imageUrl);
    console.log('First instructor department:', instructors[0].department);
    console.log('Sample of all instructor departments:', instructors.slice(0, 5).map(i => ({ 
      id: i.instructorId, 
      name: i.name, 
      department: i.department, 
      imageUrl: i.imageUrl 
    })));
    if (error) {
      console.log('🎉 SUCCESS: We have fallback data even with an error!');
    }
  }

  // Extract unique departments from instructors
  const departments = Array.from(
    new Set(
      instructors
        ?.map(instructor => instructor.department)
        .filter(Boolean) as string[]
    )
  ).sort();

  // Create a composite key based on name and surname for more reliable deduplication
  const uniqueInstructors = instructors.reduce((unique: Instructor[], current) => {
    const fullName = `${current.name || ''}${current.surname || ''}`.toLowerCase().replace(/\s+/g, '');
    
    // Skip empty names
    if (!fullName) return unique;
    
    // Check if we already have an instructor with this name
    const exists = unique.some(
      item => `${item.name || ''}${item.surname || ''}`.toLowerCase().replace(/\s+/g, '') === fullName
    );
    
    if (!exists) {
      unique.push(current);
    }
    
    return unique;
  }, []);

  // Log the results for debugging
  console.log(`Original instructors count: ${instructors.length}`);
  console.log(`After deduplication: ${uniqueInstructors.length}`);

  const filteredInstructors = uniqueInstructors.filter(instructor => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${instructor.name || ''} ${instructor.surname || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchLower) ||
      instructor.department?.toLowerCase().includes(searchLower);
    
    const matchesDepartment = !department || instructor.department === department;
    
    return matchesSearch && matchesDepartment;
  });

  // Sort the filtered instructors
  const sortedInstructors = [...filteredInstructors];
  if (sortBy === 'nameAsc') {
    sortedInstructors.sort((a, b) => {
      const nameA = `${a.name || ''} ${a.surname || ''}`;
      const nameB = `${b.name || ''} ${b.surname || ''}`;
      return nameA.localeCompare(nameB);
    });
  } else if (sortBy === 'nameDesc') {
    sortedInstructors.sort((a, b) => {
      const nameA = `${a.name || ''} ${a.surname || ''}`;
      const nameB = `${b.name || ''} ${b.surname || ''}`;
      return nameB.localeCompare(nameA);
    });
  } else if (sortBy === 'departmentAsc') {
    sortedInstructors.sort((a, b) => 
      (a.department || '').localeCompare(b.department || '')
    );
  } else if (sortBy === 'departmentDesc') {
    sortedInstructors.sort((a, b) => 
      (b.department || '').localeCompare(a.department || '')
    );
  }

  const resetFilters = () => {
    setDepartment('');
    setSortBy('nameAsc');
  };

  // Helper function to navigate to instructor detail only if ID is valid
  const navigateToInstructor = (instructorId: number | undefined) => {
    if (instructorId && !isNaN(instructorId) && instructorId > 0) {
      console.log(`Navigating to instructor detail page with ID: ${instructorId}`);
      navigate(`/instructors/${instructorId}`);
    } else {
      console.error(`Invalid instructor ID: ${instructorId}`);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }

  // Only show error if we have an error AND no fallback data
  if (error && instructors.length === 0) {
    console.error('Showing error because we have error and no fallback data:', error);
    return (
      <Container>
        <Alert severity="error" sx={{ my: 3 }}>
          Error loading instructors. Please try again later.
        </Alert>
      </Container>
    );
  }

  // If we have instructors (even with an error), show them (this handles fallback data)
  if (instructors.length === 0) {
    return (
      <Container>
        <Alert severity="info" sx={{ my: 3 }}>
          No instructors found. This might be a temporary issue.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
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
          <School sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
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
            Explore Instructors
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse through all instructors or use the search and filters to find specific ones.
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ width: { xs: '100%', md: '75%' }}}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search instructors by name, title, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '25%' }}}>
            <Button
              fullWidth
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ height: '100%' }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Box>
        </Stack>
      </Box>

      {showFilters && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Filters
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ width: { xs: '100%', md: '33.33%' }}}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  label="Department"
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '33.33%' }}}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
                  <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
                  <MenuItem value="departmentAsc">Department (A-Z)</MenuItem>
                  <MenuItem value="departmentDesc">Department (Z-A)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '33.33%' }}}>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth
                onClick={resetFilters}
                sx={{ height: '56px' }}
              >
                Reset Filters
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {sortedInstructors?.length || 0} Instructors Found
        </Typography>
      </Box>

      {sortedInstructors?.length === 0 ? (
        <Alert severity="info">No instructors match your search criteria.</Alert>
      ) : (
        <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="50px">#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell width="70px" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedInstructors?.map((instructor, index) => (
                  <TableRow 
                    key={instructor.instructorId}
                    hover
                    onClick={() => navigateToInstructor(instructor.instructorId)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={instructor.imageUrl || instructor.profileImage}
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            mr: 2,
                            bgcolor: 'primary.main',
                            fontSize: '1rem'
                          }}
                          onError={(e) => {
                            console.log(`Image failed to load for instructor ${instructor.instructorId}:`, instructor.imageUrl || instructor.profileImage);
                          }}
                        >
                          {(!instructor.imageUrl && !instructor.profileImage) ? 
                            (instructor.name || instructor.firstName || '?')[0]?.toUpperCase() : 
                            null
                          }
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {instructor.name || instructor.firstName || 'Unknown'} {instructor.surname || instructor.lastName || ''}
                          </Typography>
                          {instructor.title && (
                            <Typography variant="caption" color="text.secondary">
                              {instructor.title}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {instructor.department ? (
                        <Chip 
                          label={instructor.department} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Department not available
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToInstructor(instructor.instructorId);
                        }}
                      >
                        <ArrowForward fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Container>
  );
}