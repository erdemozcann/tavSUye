import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  School,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import apiService from '../services/api';
import type { Program } from '../types';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: program, isLoading, error } = useQuery<Program>({
    queryKey: ['program', id],
    queryFn: () => apiService.programs.getProgram(parseInt(id!)),
  });

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading program details...</Typography>
      </Container>
    );
  }

  if (error || !program) {
    return (
      <Container>
        <Typography color="error">Error loading program details. Please try again later.</Typography>
      </Container>
    );
  }

  const requirements = [
    {
      title: 'University Courses',
      credits: program.universityCredits,
      minCourses: program.universityMinCourses,
    },
    {
      title: 'Required Courses',
      credits: program.requiredCredits,
      minCourses: program.requiredMinCourses,
    },
    {
      title: 'Core Courses',
      credits: program.coreCredits,
      minCourses: program.coreMinCourses,
    },
    {
      title: 'Core Elective I',
      credits: program.coreElectiveCreditsI,
      minCourses: program.coreElectiveMinCoursesI,
    },
    {
      title: 'Core Elective II',
      credits: program.coreElectiveCreditsII,
      minCourses: program.coreElectiveMinCoursesII,
    },
    {
      title: 'Area Elective Courses',
      credits: program.areaCredits,
      minCourses: program.areaMinCourses,
    },
    {
      title: 'Free Elective Courses',
      credits: program.freeElectiveCredits,
      minCourses: program.freeElectiveMinCourses,
    },
    {
      title: 'Faculty Courses',
      credits: program.facultyCredits,
      minCourses: program.facultyMinCourses,
    },
    {
      title: 'Mathematics Courses',
      credits: program.mathRequiredCredits,
      minCourses: undefined,
    },
  ];

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {program.nameEn}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {program.nameTr}
              </Typography>
              <Chip
                icon={<School />}
                label={`Admission Term: ${program.admissionTerm}`}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Program Requirements
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requirement</TableCell>
                    <TableCell align="right">Credits</TableCell>
                    <TableCell align="right">Minimum Courses</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.title}>
                      <TableCell component="th" scope="row">
                        {req.title}
                      </TableCell>
                      <TableCell align="right">
                        {req.credits ? (
                          <Chip
                            icon={<CheckCircle />}
                            label={`${req.credits} Credits`}
                            color="primary"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Warning />}
                            label="Not specified"
                            color="default"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {req.minCourses ? (
                          <Chip
                            label={`${req.minCourses} Courses`}
                            color="secondary"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Warning />}
                            label="Not specified"
                            color="default"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Program Structure
            </Typography>
            <Grid container spacing={2}>
              {requirements.map((req) => (
                req.credits && (
                  <Grid item xs={12} sm={6} md={4} key={req.title}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {req.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<CheckCircle />}
                            label={`${req.credits} Credits`}
                            color="primary"
                            size="small"
                          />
                          {req.minCourses && (
                            <Chip
                              label={`${req.minCourses} Courses`}
                              color="secondary"
                              size="small"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 