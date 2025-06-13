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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack,
  ExpandMore,
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

// Default terms (1-8) with ability to add extra terms
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

  // Debug: Program verisini kontrol et
  useEffect(() => {
    if (program) {
      console.log('Program data from API:', program);
      console.log('Total Min Credits:', program.totalMinCredits);
      console.log('Total Min ECTS:', program.totalMinEcts);
      console.log('Engineering ECTS:', program.engineeringEcts);
      console.log('Basic Science ECTS:', program.basicScienceEcts);
    }
  }, [program]);

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
      
      const courses = programCoursesRaw.map(courseData => ({
        ...courseData,
        courseGroup: courseData.courseGroup || 'Other' // Use courseGroup from API
      })) as PlannerCourse[];
      
      // Debug: Course groups
      if (courses.length > 0) {
        console.log('Sample courses with groups:', courses.slice(0, 5).map(c => ({
          courseName: c.courseNameEn,
          courseGroup: c.courseGroup
        })));
        
        const uniqueGroups = [...new Set(courses.map(c => c.courseGroup))];
        console.log('Unique course groups from API:', uniqueGroups);
      }
      
      return courses;
    }, [programCoursesRaw]);

  // Fetch existing student plans
  const { data: existingPlans } = useQuery<StudentPlan[]>({
    queryKey: ['student-plans'],
    queryFn: () => apiService.plans.getAllPlans(),
  });

  // Load existing plans into selected courses
  useEffect(() => {
    if (existingPlans && existingPlans.length > 0) {
      const courseTermMap = new Map<number, number>();
      existingPlans.forEach(plan => {
        courseTermMap.set(plan.courseId, plan.term);
      });
      setSelectedCourses(courseTermMap);
      
      // Expand terms if needed
      const maxTerm = Math.max(...existingPlans.map(plan => plan.term));
      if (maxTerm > 8) {
        const extraTerms = Array.from({length: maxTerm - 8}, (_, i) => 9 + i);
        setAvailableTerms(prev => [...prev, ...extraTerms]);
      }
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
        'FREE': 'Free',
        'FACULTY': 'Faculty',
        // Add any other groups that might exist in database
        'ELECTIVE': 'Elective',
        'GENERAL': 'General Education',
        'MAJOR': 'Major Courses'
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

      // Create groups based on the mappings - show ALL groups that exist in database
      Object.entries(courseGroupMappings).forEach(([dbGroup, displayName]) => {
        const coursesInGroup = coursesByGroup.get(dbGroup) || [];
        
        // Only filter out regular 'Core' if we have specific Core I or Core II
        if (displayName === 'Core') {
          const hasCoreI = (coursesByGroup.get('CORE I') || []).length > 0;
          const hasCoreII = (coursesByGroup.get('CORE II') || []).length > 0;
          if (hasCoreI || hasCoreII) {
            // Skip regular Core if we have specific Core I/II
            return;
          }
        }

        if (coursesInGroup.length > 0) {
          groups.push({
            groupName: displayName,
            courses: coursesInGroup,
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
      case 'Philosophy Required': return program.philosophyRequiredCredits;
      case 'Core': return program.coreCredits;
      case 'Core I': return program.coreElectiveCreditsI;
      case 'Core II': return program.coreElectiveCreditsII;
      case 'Area': return program.areaCredits;
      case 'Free': return program.freeElectiveCredits;
      case 'Faculty': return program.facultyCredits;
      default: return undefined;
    }
  };

  // Helper function to get minimum courses for a group
  const getMinCoursesForGroup = (groupName: string, program?: Program): number | undefined => {
    if (!program) return undefined;
    
    switch (groupName) {
      case 'University': return program.universityMinCourses;
      case 'Required': return program.requiredMinCourses;
      case 'Math Required': return program.mathMinCourses;
      case 'Philosophy Required': return program.philosophyMinCourses;
      case 'Core': return program.coreMinCourses;
      case 'Core I': return program.coreElectiveMinCoursesI;
      case 'Core II': return program.coreElectiveMinCoursesII;
      case 'Area': return program.areaMinCourses;
      case 'Free': return program.freeElectiveMinCourses;
      case 'Faculty': return program.facultyMinCourses;
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
    if (termNumber <= 8) {
      return `Term ${termNumber}`;
    } else {
      // Extra terms (9+) can be summer terms or extra semesters
      return `Extra Term ${termNumber}`;
          }
    };
 
   // Helper function to normalize course group from database to display name
   const normalizeGroupName = (courseGroup: string | undefined): string => {
     if (!courseGroup) return 'Other';
     
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
       'FREE': 'Free',
       'FACULTY': 'Faculty',
       // Add any other groups that might exist in database
       'ELECTIVE': 'Elective',
       'GENERAL': 'General Education',
       'MAJOR': 'Major Courses'
     };
     
     // Return mapped name or fallback to original
     return courseGroupMappings[courseGroup] || courseGroup;
   };
 
   // Helper function to calculate actual credits for a specific group
   const calculateActualCreditsForGroup = (targetGroup: string): number => {
     return Array.from(selectedCourses.keys()).reduce((total, courseId) => {
       const course = programCourses?.find(c => c.courseId === courseId);
       if (!course) return total;
       
       const normalizedGroup = normalizeGroupName(course.courseGroup);
       return normalizedGroup === targetGroup ? total + (course.suCredit || 0) : total;
     }, 0);
   };
 
   // Helper function to calculate actual course count for a specific group
   const calculateActualCountForGroup = (targetGroup: string): number => {
     return Array.from(selectedCourses.keys()).reduce((count, courseId) => {
       const course = programCourses?.find(c => c.courseId === courseId);
       if (!course) return count;
       
       const normalizedGroup = normalizeGroupName(course.courseGroup);
       return normalizedGroup === targetGroup ? count + 1 : count;
     }, 0);
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
              {program?.nameEn} • Admission Term: {admissionTerm?.slice(0, 4)} {admissionTerm?.slice(4) === '01' ? 'Fall' : 'Spring'}
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

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr 0.8fr' },
          gap: 3 
        }}>
          {/* Course Selection Panel */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Courses
            </Typography>
            
            {courseGroups.map((group) => (
              <Accordion
                key={group.groupName}
                expanded={expandedGroups.has(group.groupName)}
                onChange={() => toggleGroupExpansion(group.groupName)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {group.groupName}
                    </Typography>
                    <Chip
                      label={`${group.courses.length} courses`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {group.requiredCredits && (
                      <Chip
                        label={`${group.requiredCredits} credits required`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
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
                </AccordionSummary>
                <AccordionDetails>
                  {loadingPrerequisites.size > 0 && expandedGroups.has(group.groupName) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Loading prerequisites...
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {group.courses.map((course) => {
                      const isSelected = selectedCourses.has(course.courseId);
                      const selectedTerm = selectedCourses.get(course.courseId);
                      const prerequisites = loadedPrerequisites?.get(course.courseId) || [];
                      const prereqsMet = checkPrerequisites(course);
                      
                      return (
                        <Card
                          key={course.courseId}
                          sx={{
                            border: isSelected ? 2 : 1,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                  {course.subject} {course.courseCode}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                  {course.courseNameEn}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                  <Chip label={`${course.suCredit} SU Credits`} size="small" />
                                  <Chip label={`${course.ectsCredit} ECTS`} size="small" />
                                  {(course.engineeringEcts || 0) > 0 && (
                                    <Chip label={`${course.engineeringEcts} Engineering ECTS`} size="small" />
                                  )}
                                  {(course.basicScienceEcts || 0) > 0 && (
                                    <Chip label={`${course.basicScienceEcts} Basic Science ECTS`} size="small" />
                                  )}
                                  <Chip label={course.faculty} size="small" />
                                </Box>
                                
                                {prerequisites.length > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Prerequisites:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      {prerequisites.map((prereq) => (
                                        <Chip
                                          key={prereq.courseId}
                                          label={`${prereq.subject} ${prereq.courseCode}`}
                                          size="small"
                                          color={selectedCourses.has(prereq.courseId) ? 'success' : 'default'}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                                
                                {isSelected && !prereqsMet && (
                                  <Alert severity="warning" sx={{ mb: 2 }}>
                                    Prerequisites not met or scheduled in wrong order
                                  </Alert>
                                )}
                              </Box>
                              
                              <Box sx={{ ml: 2 }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <InputLabel>Term</InputLabel>
                                  <Select
                                    value={selectedTerm || ''}
                                    label="Term"
                                    onChange={(e) => handleCourseTermChange(
                                      course.courseId,
                                      e.target.value ? Number(e.target.value) : null
                                    )}
                                    MenuProps={{
                                      PaperProps: {
                                        style: {
                                          maxHeight: 300,
                                          width: 120,
                                          overflow: 'auto'
                                        }
                                      },
                                      anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                      },
                                      transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left'
                                      }
                                    }}
                                  >
                                    <MenuItem value="">
                                      <em>Not selected</em>
                                    </MenuItem>
                                    {availableTerms.map((term) => (
                                      <MenuItem key={term} value={term}>
                                        {formatTerm(term)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Your Plan Panel (Middle Column) */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Plan
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={addExtraTerm}
                sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
              >
                + Extra Term
              </Button>
            </Box>
            
            {availableTerms.map((term) => {
              const termCourses = Array.from(selectedCourses.entries())
                .filter(([_, courseTerm]) => courseTerm === term)
                .map(([courseId, _]) => programCourses?.find(c => c.courseId === courseId))
                .filter(Boolean) as PlannerCourse[];
              
              const termCredits = calculateCredits(term);
              
              return (
                <Card key={term} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {formatTerm(term)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${termCredits} credits`}
                          color={termCredits > 20 ? 'warning' : termCredits > 0 ? 'primary' : 'default'}
                          size="small"
                        />
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
                    </Box>
                    
                    {termCourses.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No courses selected
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {termCourses.map((course) => (
                          <Box
                            key={course.courseId}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {/* Course Code */}
                            <Typography variant="body2" fontWeight="medium">
                              {course.subject} {course.courseCode}
                            </Typography>
                            
                            {/* Credits & Actions */}
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <Chip label={`${course.suCredit} SU`} size="small" />
                              <Chip label={`${course.ectsCredit} ECTS`} size="small" />
                              <IconButton
                                size="small"
                                onClick={() => handleCourseTermChange(course.courseId, null)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Paper>

          {/* Program Summary Panel (Right Column) */}
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Program Summary
                </Typography>
                
                                  {/* Program Totals */}
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Program SU Credit</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid #ddd'
                  }}>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: 'info.light',
                      color: 'black',
                      borderRight: '2px solid #333'
                    }}>
                      <Typography variant="body2">Min: {program?.totalMinCredits || 0}</Typography>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: (() => {
                        const actualSU = Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                         const course = programCourses?.find(c => c.courseId === courseId);
                         return total + (course?.suCredit || 0);
                         }, 0);
                         const minSU = program?.totalMinCredits || 0;
                         return actualSU >= minSU ? 'success.light' : 'warning.light';
                       })(),
                       color: 'black'
                     }}>
                       <Typography variant="body2">Actual: {Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                         const course = programCourses?.find(c => c.courseId === courseId);
                         return total + (course?.suCredit || 0);
                       }, 0)}</Typography>
                     </Box>
                  </Box>

                                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Program ECTS Credit</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid #ddd'
                  }}>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: 'info.light',
                      color: 'black',
                      borderRight: '2px solid #333'
                    }}>
                      <Typography variant="body2">Min: {program?.totalMinEcts || 0}</Typography>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      p: 1, 
                      bgcolor: (() => {
                        const actualECTS = Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                         const course = programCourses?.find(c => c.courseId === courseId);
                         return total + (course?.ectsCredit || 0);
                         }, 0);
                         const minECTS = program?.totalMinEcts || 0;
                         return actualECTS >= minECTS ? 'success.light' : 'warning.light';
                       })(),
                       color: 'black'
                     }}>
                       <Typography variant="body2">Actual: {Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                         const course = programCourses?.find(c => c.courseId === courseId);
                         return total + (course?.ectsCredit || 0);
                       }, 0)}</Typography>
                     </Box>
                  </Box>

                                  {program?.engineeringEcts && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Engineering ECTS Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.engineeringEcts}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualEng = Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                             const course = programCourses?.find(c => c.courseId === courseId);
                             return total + (course?.engineeringEcts || 0);
                             }, 0);
                             return actualEng >= program.engineeringEcts ? 'success.light' : 'warning.light';
                           })(),
                           color: 'black'
                         }}>
                           <Typography variant="body2">Actual: {Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                             const course = programCourses?.find(c => c.courseId === courseId);
                             return total + (course?.engineeringEcts || 0);
                           }, 0)}</Typography>
                         </Box>
                      </Box>
                    </>
                  )}

                                  {program?.basicScienceEcts && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Basic Science ECTS Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.basicScienceEcts}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualBS = Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                             const course = programCourses?.find(c => c.courseId === courseId);
                             return total + (course?.basicScienceEcts || 0);
                             }, 0);
                             return actualBS >= program.basicScienceEcts ? 'success.light' : 'warning.light';
                           })(),
                           color: 'black'
                         }}>
                           <Typography variant="body2">Actual: {Array.from(selectedCourses.keys()).reduce((total, courseId) => {
                             const course = programCourses?.find(c => c.courseId === courseId);
                             return total + (course?.basicScienceEcts || 0);
                           }, 0)}</Typography>
                         </Box>
                      </Box>
                    </>
                  )}

                                  {/* 1. University Courses Credit */}
                  {program?.universityCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>University Courses Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.universityCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualUniv = calculateActualCreditsForGroup('University');
                            return actualUniv >= program.universityCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('University')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 2. Required Courses Credit */}
                  {program?.requiredCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Required Courses Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.requiredCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualReq = calculateActualCreditsForGroup('Required');
                            return actualReq >= program.requiredCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Required')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Required Courses Count */}
                  {program?.requiredMinCourses && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Required Courses Count</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.requiredMinCourses}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualReqCount = calculateActualCountForGroup('Required');
                            return actualReqCount >= program.requiredMinCourses ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCountForGroup('Required')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 3. Math Required Credits */}
                  {program?.mathRequiredCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Math Required Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.mathRequiredCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualMath = calculateActualCreditsForGroup('Math Required');
                            return actualMath >= program.mathRequiredCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Math Required')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 4. Philosophy Required Credits */}
                  {program?.philosophyRequiredCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Philosophy Required Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.philosophyRequiredCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualPhil = calculateActualCreditsForGroup('Philosophy Required');
                            return actualPhil >= program.philosophyRequiredCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Philosophy Required')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 5. Core Courses Credit (eğer tek Core varsa) */}
                  {program?.coreCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Core Courses Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.coreCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualCore = calculateActualCreditsForGroup('Core');
                            return actualCore >= program.coreCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Core')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 6. Core I Credits (eğer ayrı Core I/II varsa) */}
                  {program?.coreElectiveCreditsI && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Core I Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.coreElectiveCreditsI}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualCoreI = calculateActualCreditsForGroup('Core I');
                            return actualCoreI >= program.coreElectiveCreditsI ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Core I')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 7. Core II Credits (eğer ayrı Core I/II varsa) */}
                  {program?.coreElectiveCreditsII && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Core II Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.coreElectiveCreditsII}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualCoreII = calculateActualCreditsForGroup('Core II');
                            return actualCoreII >= program.coreElectiveCreditsII ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Core II')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 8. Area Courses Credit */}
                  {program?.areaCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Area Courses Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.areaCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualArea = calculateActualCreditsForGroup('Area');
                            return actualArea >= program.areaCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Area')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 9. Free Courses Credit */}
                  {program?.freeElectiveCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Free Courses Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.freeElectiveCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualFree = calculateActualCreditsForGroup('Free');
                            return actualFree >= program.freeElectiveCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Free')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 10. Faculty Credits */}
                  {program?.facultyCredits && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>Faculty Credit</Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: 'info.light',
                          color: 'black',
                          borderRight: '2px solid #333'
                        }}>
                          <Typography variant="body2">Min: {program.facultyCredits}</Typography>
                        </Box>
                        <Box sx={{ 
                          flex: 1, 
                          p: 1, 
                          bgcolor: (() => {
                            const actualFaculty = calculateActualCreditsForGroup('Faculty');
                            return actualFaculty >= program.facultyCredits ? 'success.light' : 'warning.light';
                          })(),
                          color: 'black'
                        }}>
                          <Typography variant="body2">Actual: {calculateActualCreditsForGroup('Faculty')}</Typography>
                        </Box>
                      </Box>
                    </>
                  )}
              </CardContent>
            </Card>
          </Paper>
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