import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  School,
  Search as SearchIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import apiService, { courseApi } from '../services/api';
import type { StudentPlan, Course } from '../types';

export default function Plans() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudentPlan | null>(null);
  const [term, setTerm] = useState('');
  const [admissionTerm, setAdmissionTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<string>('');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery<StudentPlan[]>({
    queryKey: ['plans'],
    queryFn: () => apiService.plans.getPlans(),
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<string[]>({
    queryKey: ['subjects'],
    queryFn: () => apiService.courses.getSubjects(),
  });

    // Fetch all courses using bulk API - ULTRA FAST VERSION
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        console.log('Starting bulk course fetch...');
        const startTime = Date.now();
        
        // Use the new bulk API endpoint - single call instead of 1000+
        const allCourses = await apiService.courses.getAllCourses(true); // Only active courses
        
        console.log(`Bulk fetch completed in ${Date.now() - startTime}ms. Loaded ${allCourses.length} courses.`);
        setAllCourses(allCourses);
        
      } catch (error) {
        console.error('Error in bulk course fetching:', error);
        
        // Fallback to old parallel method if bulk API fails
        console.log('Falling back to parallel fetching method...');
        await fallbackParallelFetch();
      }
    };

    // Fallback method using parallel individual calls
    const fallbackParallelFetch = async () => {
      if (!subjects.length) return;
      
      try {
        console.log(`Starting parallel fetch for ${subjects.length} subjects...`);
        const startTime = Date.now();
        
        // 1. Paralel olarak tüm subject'ler için course code'ları al
        const subjectCodesPromises = subjects.map(async (subject) => {
          try {
            const courseCodes = await apiService.courses.getCourseCodesBySubject(subject);
            return { subject, courseCodes };
          } catch (error) {
            console.error(`Error fetching course codes for ${subject}:`, error);
            return { subject, courseCodes: [] };
          }
        });
        
        const subjectCodesResults = await Promise.all(subjectCodesPromises);
        console.log(`Fetched course codes for all subjects in ${Date.now() - startTime}ms`);
        
        // 2. Paralel olarak tüm kursları al (batch'ler halinde)
        const allCoursesPromises: Promise<Course>[] = [];
        
        subjectCodesResults.forEach(({ subject, courseCodes }) => {
          courseCodes.forEach((courseCode: string) => {
            allCoursesPromises.push(
              apiService.courses.getCourse(subject, courseCode).catch(error => {
                console.error(`Error fetching course ${subject}-${courseCode}:`, error);
                // Return a placeholder course object to avoid breaking Promise.all
                return {
                  courseId: 0,
                  subject,
                  courseCode,
                  courseNameEn: `${subject} ${courseCode}`,
                  courseNameTr: `${subject} ${courseCode}`,
                  suCredit: 0,
                  ectsCredit: 0,
                  courseStatus: true
                } as Course;
              })
            );
          });
        });
        
        console.log(`Starting parallel fetch for ${allCoursesPromises.length} courses...`);
        
        // 3. Batch'ler halinde paralel çağrı (server'ı overwhelm etmemek için)
        const BATCH_SIZE = 50; // Aynı anda maksimum 50 çağrı
        const batches: Promise<Course>[][] = [];
        
        for (let i = 0; i < allCoursesPromises.length; i += BATCH_SIZE) {
          batches.push(allCoursesPromises.slice(i, i + BATCH_SIZE));
        }
        
        const allCourses: Course[] = [];
        
        for (let i = 0; i < batches.length; i++) {
          const batchStartTime = Date.now();
          console.log(`Processing batch ${i + 1}/${batches.length} (${batches[i].length} courses)...`);
          
          const batchResults = await Promise.all(batches[i]);
          allCourses.push(...batchResults.filter(course => course.courseId !== 0)); // Filter out error placeholders
          
          console.log(`Batch ${i + 1} completed in ${Date.now() - batchStartTime}ms`);
          
          // Kısa bir delay ekle (server'ı rahatlatmak için)
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log(`Fallback fetch completed in ${Date.now() - startTime}ms. Loaded ${allCourses.length} courses.`);
        setAllCourses(allCourses);
        
      } catch (error) {
        console.error('Error in fallback parallel course fetching:', error);
      }
    };
    
    fetchAllCourses();
  }, []); // Remove subjects dependency since we're using bulk API

  const createPlanMutation = useMutation({
    mutationFn: (plan: Partial<StudentPlan>) => apiService.plans.createPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsDialogOpen(false);
      setTerm('');
      setAdmissionTerm('');
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, plan }: { planId: number; plan: Partial<StudentPlan> }) =>
      apiService.plans.updatePlan(planId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsDialogOpen(false);
      setSelectedPlan(null);
      setTerm('');
      setAdmissionTerm('');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId: number) => apiService.plans.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const addCoursesToPlanMutation = useMutation({
    mutationFn: ({ planId, courses }: { planId: number; courses: Course[] }) => {
      // In a real implementation, you would have an API endpoint for this
      // For now, we'll simulate by updating the plan with the new courses
      const currentPlan = plans?.find(p => p.planId === planId);
      if (!currentPlan) throw new Error("Plan not found");
      
      const updatedCourses = [...currentPlan.courses, ...courses];
      return apiService.plans.updatePlan(planId, { courses: updatedCourses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsAddCourseDialogOpen(false);
      setSelectedCourses([]);
    },
  });

  const removeCourseFromPlanMutation = useMutation({
    mutationFn: ({ planId, courseId }: { planId: number; courseId: number }) => {
      // In a real implementation, you would have an API endpoint for this
      // For now, we'll simulate by updating the plan with the course removed
      const currentPlan = plans?.find(p => p.planId === planId);
      if (!currentPlan) throw new Error("Plan not found");
      
      const updatedCourses = currentPlan.courses.filter(c => c.courseId !== courseId);
      return apiService.plans.updatePlan(planId, { courses: updatedCourses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const handleCreatePlan = () => {
    createPlanMutation.mutate({ 
      term: parseInt(term),
      admissionTerm: parseInt(admissionTerm)
    });
  };

  const handleUpdatePlan = () => {
    if (selectedPlan) {
      updatePlanMutation.mutate({
        planId: selectedPlan.planId,
        plan: { 
          term: parseInt(term),
          admissionTerm: parseInt(admissionTerm)
        },
      });
    }
  };

  const handleAddCoursesToPlan = () => {
    if (selectedPlan && selectedCourses.length > 0) {
      addCoursesToPlanMutation.mutate({
        planId: selectedPlan.planId,
        courses: selectedCourses,
      });
    }
  };

  const handleRemoveCourseFromPlan = (planId: number, courseId: number) => {
    removeCourseFromPlanMutation.mutate({ planId, courseId });
  };

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.courseNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFaculty = faculty === '' || course.faculty === faculty;
    
    return matchesSearch && matchesFaculty;
  });

  if (isLoading || isLoadingSubjects || (subjects.length > 0 && allCourses.length === 0)) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPlan(null);
              setTerm('');
              setAdmissionTerm('');
              setIsDialogOpen(true);
            }}
          >
            Create New Plan
          </Button>
        </Box>

        {plans && plans.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No plans found. Create a new one to get started.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {plans?.map((plan) => (
              <Card key={plan.planId}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Term {plan.term}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<School />}
                          label={`${plan.courses.length} Courses`}
                          size="small"
                        />
                        {plan.admissionTerm && (
                          <Chip
                            label={`Admission Term: ${plan.admissionTerm}`}
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setSelectedCourses([]);
                          setIsAddCourseDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Add Courses
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setTerm(plan.term.toString());
                          setAdmissionTerm(plan.admissionTerm?.toString() || '');
                          setIsDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deletePlanMutation.mutate(plan.planId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {plan.courses.map((course: Course) => (
                      <Box key={`${course.subject}-${course.courseCode}`} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.667px)' } }}>
                        <Paper sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>
                                {course.subject} {course.courseCode}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {course.courseNameEn}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip
                                  label={`${course.suCredit} SU Credits`}
                                  size="small"
                                />
                                <Chip
                                  label={`${course.ectsCredit} ECTS`}
                                  size="small"
                                />
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveCourseFromPlan(plan.planId, course.courseId)}
                            >
                              <RemoveCircleIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Term (e.g., 202401)"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Admission Term (e.g., 202009)"
            value={admissionTerm}
            onChange={(e) => setAdmissionTerm(e.target.value)}
            helperText="The term you were admitted to the university. This affects your graduation requirements."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedPlan ? handleUpdatePlan : handleCreatePlan}
            variant="contained"
            disabled={!term.trim()}
          >
            {selectedPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Courses Dialog */}
      <Dialog 
        open={isAddCourseDialogOpen} 
        onClose={() => setIsAddCourseDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add Courses to Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flexGrow: 1, width: { xs: '100%', md: 'calc(66.667% - 8px)' } }}>
                <TextField
                  fullWidth
                  label="Search Courses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 8px)' } }}>
                <FormControl fullWidth>
                  <InputLabel>Faculty</InputLabel>
                  <Select
                    value={faculty}
                    label="Faculty"
                    onChange={(e) => setFaculty(e.target.value)}
                  >
                    <MenuItem value="">All Faculties</MenuItem>
                    <MenuItem value="FENS">Faculty of Engineering and Natural Sciences</MenuItem>
                    <MenuItem value="FASS">Faculty of Arts and Social Sciences</MenuItem>
                    <MenuItem value="SL">School of Languages</MenuItem>
                    <MenuItem value="FMAN">Faculty of Management</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Courses ({selectedCourses.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedCourses.map(course => (
                <Chip
                  key={course.courseId}
                  label={`${course.subject} ${course.courseCode}`}
                  onDelete={() => setSelectedCourses(prev => prev.filter(c => c.courseId !== course.courseId))}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Available Courses
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: '300px', overflow: 'auto' }}>
            {filteredCourses.map(course => (
              <Box key={course.courseId} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: selectedCourses.some(c => c.courseId === course.courseId) 
                      ? 'action.selected' 
                      : 'background.paper'
                  }}
                  onClick={() => {
                    if (selectedCourses.some(c => c.courseId === course.courseId)) {
                      setSelectedCourses(prev => prev.filter(c => c.courseId !== course.courseId));
                    } else {
                      setSelectedCourses(prev => [...prev, course]);
                    }
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {course.subject} {course.courseCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                    {course.courseNameEn}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip size="small" label={`${course.suCredit} SU`} />
                    <Chip size="small" label={course.faculty || 'Unknown'} />
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCourseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCoursesToPlan}
            variant="contained"
            disabled={selectedCourses.length === 0}
          >
            Add Selected Courses
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 