import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack,
  ExpandMore,
  Warning,
  CheckCircle,
  School,
  Clear as ClearIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import type { Program, Course, StudentPlan } from '../types';

interface PlannerCourse extends Course {
  term?: number;
  prerequisites?: Course[];
  isPrerequisiteMet?: boolean;
  courseGroup?: string;
}

interface CourseGroup {
  groupName: string;
  courses: PlannerCourse[];
  requiredCredits?: number;
  minCourses?: number;
}

// Simple term numbers (1-8 with ability to add more)
const DEFAULT_TERMS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Planner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const nameEn = searchParams.get('nameEn');
  const admissionTerm = searchParams.get('admissionTerm');
  
  const [selectedCourses, setSelectedCourses] = useState<Map<number, number>>(new Map()); // courseId -> term
  const [availableTerms, setAvailableTerms] = useState<number[]>(DEFAULT_TERMS);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Lazy load prerequisites for specific courses when needed
  const [loadedPrerequisites, setLoadedPrerequisites] = useState<Map<number, Course[]>>(new Map());
  const [loadingPrerequisites, setLoadingPrerequisites] = useState<Set<number>>(new Set());

  // Add extra term functionality
  const addExtraTerm = () => {
    const maxTerm = Math.max(...availableTerms);
    setAvailableTerms(prev => [...prev, maxTerm + 1]);
  };

  // Remove extra term functionality
  const removeExtraTerm = (termToRemove: number) => {
    if (termToRemove <= 8) return; // Don't allow removing default terms
    
    // Remove courses from this term
    const newSelectedCourses = new Map(selectedCourses);
    for (const [courseId, term] of newSelectedCourses.entries()) {
      if (term === termToRemove) {
        newSelectedCourses.delete(courseId);
      }
    }
    setSelectedCourses(newSelectedCourses);
    
    // Remove the term
    setAvailableTerms(prev => prev.filter(term => term !== termToRemove));
  };

  // Fetch program details
  const { data: program, isLoading: isProgramLoading } = useQuery<Program>({
    queryKey: ['program-details', nameEn, admissionTerm],
    queryFn: () => apiService.programs.getProgramDetails(nameEn!, admissionTerm!),
    enabled: !!nameEn && !!admissionTerm,
  });

  // Fetch program courses with proper API call
  const { data: programCoursesRaw, isLoading: isCoursesLoading, error: coursesError } = useQuery<any[]>({
    queryKey: ['program-courses', program?.programId],
    queryFn: async () => {
      if (!program?.programId) throw new Error('Program ID not available');
      
      // Use the proper API endpoint as per documentation
      const response = await apiService.programs.getProgramCourses(program.programId);
      console.log('Raw program courses response:', response);
      return response;
    },
    enabled: !!program?.programId,
    retry: 2,
    retryDelay: 1000,
  });

  // Transform raw course data to include course groups from API
  const programCourses = useMemo(() => {
    if (!programCoursesRaw) return [];
    
    return programCoursesRaw.map(courseData => ({
      ...courseData,
      courseGroup: courseData.courseGroup || 'Other' // Use courseGroup from API
    })) as PlannerCourse[];
  }, [programCoursesRaw]);

  // Fetch existing student plans
  const { data: existingPlans } = useQuery<StudentPlan[]>({
    queryKey: ['student-plans'],
    queryFn: () => apiService.plans.getPlans(),
  });

  // Load existing plans into selected courses
  useEffect(() => {
    if (existingPlans && existingPlans.length > 0) {
      const courseTermMap = new Map<number, number>();
      existingPlans.forEach(plan => {
        plan.courses.forEach(course => {
          courseTermMap.set(course.courseId, plan.term);
        });
      });
      setSelectedCourses(courseTermMap);
    }
  }, [existingPlans]);

  // Load prerequisites for courses in expanded groups
  useEffect(() => {
    if (!programCourses) return;
    
    const courseGroups = groupCoursesByType(programCourses);
    const coursesToLoad: number[] = [];
    
    courseGroups.forEach(group => {
      if (expandedGroups.has(group.groupName)) {
        group.courses.forEach(course => {
          if (!loadedPrerequisites.has(course.courseId) && !loadingPrerequisites.has(course.courseId)) {
            coursesToLoad.push(course.courseId);
          }
        });
      }
    });
    
    // Load prerequisites in small batches
    const loadInBatches = async () => {
      const BATCH_SIZE = 5;
      for (let i = 0; i < coursesToLoad.length; i += BATCH_SIZE) {
        const batch = coursesToLoad.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(courseId => loadPrerequisitesForCourse(courseId)));
        
        // Small delay between batches
        if (i + BATCH_SIZE < coursesToLoad.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };
    
    if (coursesToLoad.length > 0) {
      loadInBatches();
    }
  }, [expandedGroups, programCourses, loadedPrerequisites, loadingPrerequisites]);

  const loadPrerequisitesForCourse = async (courseId: number) => {
    if (loadedPrerequisites.has(courseId) || loadingPrerequisites.has(courseId)) {
      return;
    }

    setLoadingPrerequisites(prev => new Set(prev).add(courseId));
    
    try {
      const prerequisites = await apiService.programs.getPrerequisites(courseId);
      setLoadedPrerequisites(prev => new Map(prev).set(courseId, prerequisites));
    } catch (error) {
      console.warn(`Failed to fetch prerequisites for course ${courseId}:`, error);
      setLoadedPrerequisites(prev => new Map(prev).set(courseId, []));
    } finally {
      setLoadingPrerequisites(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // Save plan mutation
  const saveAllPlansMutation = useMutation({
    mutationFn: async () => {
      // First delete all existing plans
      await apiService.plans.deleteAllPlans();
      
      // Then save each selected course with its term
      const savePromises = Array.from(selectedCourses.entries()).map(([courseId, term]) =>
        apiService.plans.savePlan(courseId, term)
      );
      
      await Promise.all(savePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-plans'] });
      setIsSaveDialogOpen(false);
    },
    onError: (error) => {
      console.error('Failed to save plan:', error);
    },
  });

  const handleCourseTermChange = (courseId: number, term: number | null) => {
    const newSelectedCourses = new Map(selectedCourses);
    if (term === null) {
      newSelectedCourses.delete(courseId);
    } else {
      newSelectedCourses.set(courseId, term);
    }
    setSelectedCourses(newSelectedCourses);
  };

  const handleSavePlan = () => {
    setIsSaveDialogOpen(true);
  };

  const checkPrerequisites = (course: PlannerCourse): boolean => {
    const prerequisites = loadedPrerequisites.get(course.courseId) || [];
    if (prerequisites.length === 0) return true;

    const selectedTermForCourse = selectedCourses.get(course.courseId);
    if (!selectedTermForCourse) return true;

    return prerequisites.every(prereq => {
      const prereqTerm = selectedCourses.get(prereq.courseId);
      return prereqTerm && prereqTerm < selectedTermForCourse;
    });
  };

  // Group courses by type according to the user's requirements
  const groupCoursesByType = useMemo(() => {
    return (courses: PlannerCourse[]): CourseGroup[] => {
      if (!courses || courses.length === 0) return [];
      
      const groups: CourseGroup[] = [];
      const programName = program?.nameEn?.toLowerCase() || '';
      
      // Define course groups mapping from database values (ALL CAPS) to display names
      const courseGroupMappings: { [key: string]: string } = {
        'UNIVERSITY': 'University',
        'REQUIRED': 'Required', 
        'MATH': 'Math Required',
        'PHIL': 'Philosophy Required',
        'CORE': 'Core',
        'CORE I': 'Core I',
        'CORE II': 'Core II', 
        'AREA': 'Area',
        'FREE': 'Free'
      };

      // Group courses by their courseGroup field from the API
      const coursesByGroup = new Map<string, PlannerCourse[]>();
      
      courses.forEach(course => {
        const group = course.courseGroup || 'Other';
        if (!coursesByGroup.has(group)) {
          coursesByGroup.set(group, []);
        }
        coursesByGroup.get(group)!.push(course);
      });

      // Create groups based on the mappings and program-specific rules
      Object.entries(courseGroupMappings).forEach(([dbGroup, displayName]) => {
        const coursesInGroup = coursesByGroup.get(dbGroup) || [];
        
        // Apply program-specific filtering
        let filteredCourses = coursesInGroup;
        
        // Math Required only for ECON
        if (displayName === 'Math Required' && !programName.includes('econ')) {
          filteredCourses = [];
        }
        
        // Philosophy Required only for PHIL
        if (displayName === 'Philosophy Required' && !programName.includes('phil')) {
          filteredCourses = [];
        }
        
        // Core I and Core II only for Political Science, International Relations, and VA
        if ((displayName === 'Core I' || displayName === 'Core II') && 
            !programName.includes('political') && 
            !programName.includes('international') && 
            !programName.includes('va')) {
          filteredCourses = [];
        }
        
        // If we have Core I or Core II, don't show regular Core
        if (displayName === 'Core') {
          const hasCoreI = (coursesByGroup.get('CORE I') || []).length > 0;
          const hasCoreII = (coursesByGroup.get('CORE II') || []).length > 0;
          if ((hasCoreI || hasCoreII) && 
              (programName.includes('political') || 
               programName.includes('international') || 
               programName.includes('va'))) {
            filteredCourses = [];
          }
        }

        if (filteredCourses.length > 0) {
          groups.push({
            groupName: displayName,
            courses: filteredCourses,
            requiredCredits: getRequiredCreditsForGroup(displayName, program),
            minCourses: getMinCoursesForGroup(displayName, program),
          });
        }
      });

      return groups.filter(group => group.courses.length > 0);
    };
  }, [program]);

  // Helper function to get required credits for a group
  const getRequiredCreditsForGroup = (groupName: string, program?: Program): number | undefined => {
    if (!program) return undefined;
    
    switch (groupName) {
      case 'University': return program.universityCredits;
      case 'Required': return program.requiredCredits;
      case 'Math Required': return program.mathRequiredCredits;
      case 'Core': return program.coreCredits;
      case 'Core I': return program.coreElectiveCreditsI;
      case 'Core II': return program.coreElectiveCreditsII;
      case 'Area': return program.areaCredits;
      case 'Free': return program.freeElectiveCredits;
      default: return undefined;
    }
  };

  // Helper function to get minimum courses for a group
  const getMinCoursesForGroup = (groupName: string, program?: Program): number | undefined => {
    if (!program) return undefined;
    
    switch (groupName) {
      case 'University': return program.universityMinCourses;
      case 'Required': return program.requiredMinCourses;
      case 'Core': return program.coreMinCourses;
      case 'Core I': return program.coreElectiveMinCoursesI;
      case 'Core II': return program.coreElectiveMinCoursesII;
      case 'Area': return program.areaMinCourses;
      case 'Free': return program.freeElectiveMinCourses;
      default: return undefined;
    }
  };

  const calculateCredits = (termNumber: number): number => {
    return Array.from(selectedCourses.entries())
      .filter(([_, term]) => term === termNumber)
      .reduce((total, [courseId, _]) => {
        const course = programCourses?.find(c => c.courseId === courseId);
        return total + (course?.suCredit || 0);
      }, 0);
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Show timeout warning after 30 seconds
  useEffect(() => {
    if (isProgramLoading || isCoursesLoading) {
      const timer = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 30000);

      return () => clearTimeout(timer);
    } else {
      setShowTimeoutWarning(false);
    }
  }, [isProgramLoading, isCoursesLoading]);

  const courseGroups = useMemo(() => {
    const groups = programCourses ? groupCoursesByType(programCourses) : [];
    
    return groups;
  }, [programCourses, groupCoursesByType, program]);

  const formatTerm = (termNumber: number): string => {
    return `Term ${termNumber}`;
  };

  if (!nameEn || !admissionTerm) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Missing program information. Please go back and select a program.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/programs')}
          sx={{ mt: 2 }}
        >
          Back to Programs
        </Button>
      </Container>
    );
  }

  if (isProgramLoading || isCoursesLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading Academic Planner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isProgramLoading && 'Loading program details...'}
            {isCoursesLoading && 'Loading program courses...'}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center', maxWidth: 400 }}>
            We're fetching course information and prerequisites from the database.
          </Typography>
          
          {showTimeoutWarning && (
            <Alert severity="warning" sx={{ mt: 3, maxWidth: 500 }}>
              <Typography variant="body2" gutterBottom>
                The planner is taking longer than usual to load. This might be due to:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>High server load</li>
                <li>Large number of courses in this program</li>
                <li>Network connectivity issues</li>
              </ul>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.location.reload()}
                  sx={{ mr: 1 }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/programs')}
                >
                  Go Back
                </Button>
              </Box>
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  if (coursesError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load courses for this program. This might be due to server overload or network issues.
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Retry
            </Button>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/programs')}
            >
              Back to Programs
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Academic Planner
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {program?.nameEn} • Admission Term: {formatTerm(parseInt(admissionTerm!))}
            </Typography>
          </Box>
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/programs')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePlan}
              disabled={selectedCourses.size === 0 || saveAllPlansMutation.isPending}
            >
              {saveAllPlansMutation.isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </Box>
        </Box>

        {/* Term Overview */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Term Overview
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addExtraTerm}
              size="small"
              variant="outlined"
            >
              Add Extra Term
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {availableTerms.map(term => (
              <Box key={term} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {formatTerm(term)}
                      </Typography>
                      {term > 8 && (
                        <IconButton
                          size="small"
                          onClick={() => removeExtraTerm(term)}
                          color="error"
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="h6" color="primary">
                      {calculateCredits(term)} Credits
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Array.from(selectedCourses.entries()).filter(([_, t]) => t === term).length} Courses
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Course Groups */}
        <Box>
          {courseGroups.map((group) => (
            <Accordion
              key={group.groupName}
              expanded={expandedGroups.has(group.groupName)}
              onChange={() => toggleGroupExpansion(group.groupName)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                  <Typography variant="h6">{group.groupName}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`${group.courses.length} courses`}
                      size="small"
                    />
                    {group.requiredCredits && (
                      <Chip
                        label={`${group.requiredCredits} credits required`}
                        size="small"
                        color="primary"
                      />
                    )}
                    {group.minCourses && (
                      <Chip
                        label={`${group.minCourses} min courses`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="center">Credits</TableCell>
                        <TableCell align="center">Prerequisites</TableCell>
                        <TableCell align="center">Term</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.courses.map((course) => {
                        const prerequisites = loadedPrerequisites.get(course.courseId) || [];
                        const isPrereqMet = checkPrerequisites(course);
                        const selectedTerm = selectedCourses.get(course.courseId);
                        
                        return (
                          <TableRow key={course.courseId}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {course.subject} {course.courseCode}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {course.courseNameEn}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${course.suCredit} SU`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {loadingPrerequisites.has(course.courseId) ? (
                                <CircularProgress size={16} />
                              ) : prerequisites.length > 0 ? (
                                <Tooltip title={prerequisites.map(p => `${p.subject} ${p.courseCode}`).join(', ')}>
                                  <Chip
                                    icon={isPrereqMet ? <CheckCircle /> : <Warning />}
                                    label={prerequisites.length}
                                    size="small"
                                    color={isPrereqMet ? "success" : "warning"}
                                  />
                                </Tooltip>
                              ) : (
                                <Chip label="None" size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={selectedTerm?.toString() || ''}
                                  onChange={(e) => handleCourseTermChange(course.courseId, e.target.value ? parseInt(e.target.value as string) : null)}
                                  displayEmpty
                                >
                                  <MenuItem value="">
                                    <em>Not selected</em>
                                  </MenuItem>
                                  {availableTerms.map(term => (
                                    <MenuItem key={term} value={term.toString()}>
                                      {formatTerm(term)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="center">
                              {selectedTerm && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleCourseTermChange(course.courseId, null)}
                                  color="error"
                                >
                                  <ClearIcon />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)}>
        <DialogTitle>Save Academic Plan</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to save this academic plan? This will replace any existing saved plan.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selected courses: {selectedCourses.size}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => saveAllPlansMutation.mutate()}
            variant="contained"
            disabled={saveAllPlansMutation.isPending}
          >
            {saveAllPlansMutation.isPending ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 