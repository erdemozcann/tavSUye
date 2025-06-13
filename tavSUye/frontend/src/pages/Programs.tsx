import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  School,
  Star,
  StarBorder,
  ArrowForward,
} from '@mui/icons-material';
import apiService from '../services/api';

// All available admission terms from database
const ADMISSION_TERMS = [
  201701, 201702, 201703, 201801, 201802, 201803, 201901, 201902, 201903,
  202001, 202002, 202003, 202101, 202102, 202103, 202201, 202202, 202203,
  202301, 202302, 202303, 202401, 202402, 202403, 202501, 202502, 202503
];

export default function Programs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedAdmissionTerm, setSelectedAdmissionTerm] = useState<number | ''>('');
  const navigate = useNavigate();

  const { data: programs, isLoading, error } = useQuery<{ name_en: string; name_tr: string }[]>({
    queryKey: ['programs'],
    queryFn: () => apiService.programs.getPrograms(),
  });

  const filteredPrograms = programs?.filter((program: { name_en: string; name_tr: string }) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      program.name_en.toLowerCase().includes(searchLower) ||
      program.name_tr.toLowerCase().includes(searchLower)
    );
  });

  const formatTerm = (termNumber: number): string => {
    const year = Math.floor(termNumber / 100);
    const semester = termNumber % 100;
    const semesterName = semester === 1 ? 'Fall' : semester === 2 ? 'Spring' : 'Summer';
    return `${year} ${semesterName}`;
  };

  const handleProceedToPlanner = () => {
    if (selectedProgram && selectedAdmissionTerm) {
      const params = new URLSearchParams({
        nameEn: selectedProgram,
        admissionTerm: selectedAdmissionTerm.toString()
      });
      navigate(`/planner?${params.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading programs. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Academic Program Planner
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Select your program and admission term to create your academic plan
        </Typography>

        {/* Program Selection */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search programs by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filteredPrograms?.map((program: { name_en: string; name_tr: string }) => (
              <Box key={program.name_en} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 10.667px)' } }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    border: selectedProgram === program.name_en ? 2 : 1,
                    borderColor: selectedProgram === program.name_en ? 'primary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => setSelectedProgram(program.name_en)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {program.name_en}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          {program.name_tr}
                        </Typography>
                      </Box>
                      <Tooltip title="Add to favorites">
                        <IconButton size="small">
                          <StarBorder />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<School />}
                        label="Academic Program"
                        size="small"
                      />
                      {selectedProgram === program.name_en && (
                        <Chip
                          label="Selected"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Admission Term Selection */}
        {selectedProgram && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Your Admission Term
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Admission Term</InputLabel>
              <Select
                value={selectedAdmissionTerm}
                label="Admission Term"
                onChange={(e) => setSelectedAdmissionTerm(e.target.value as number)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      width: 180,
                    },
                  },
                }}
              >
                {ADMISSION_TERMS.map(term => (
                  <MenuItem key={term} value={term}>
                    {formatTerm(term)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Proceed Button */}
        {selectedProgram && selectedAdmissionTerm && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleProceedToPlanner}
              sx={{ px: 4, py: 2 }}
            >
              Proceed to Academic Planner
            </Button>
          </Box>
        )}

        {/* Selection Summary */}
        {(selectedProgram || selectedAdmissionTerm) && (
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Selection Summary
            </Typography>
            {selectedProgram && (
              <Typography variant="body1" gutterBottom>
                <strong>Program:</strong> {selectedProgram}
              </Typography>
            )}
            {selectedAdmissionTerm && (
              <Typography variant="body1" gutterBottom>
                <strong>Admission Term:</strong> {formatTerm(selectedAdmissionTerm)}
              </Typography>
            )}
            {!selectedProgram && (
              <Typography variant="body2" color="text.secondary">
                Please select a program above
              </Typography>
            )}
            {!selectedAdmissionTerm && selectedProgram && (
              <Typography variant="body2" color="text.secondary">
                Please select your admission term
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
} 