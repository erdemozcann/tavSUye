import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService, { adminApi } from '../../services/api';
import type { Course } from '../../types';

// Validation schema for course form
const courseValidationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  courseCode: Yup.string().required('Course code is required'),
  courseNameEn: Yup.string().required('English course name is required'),
  courseNameTr: Yup.string().required('Turkish course name is required'),
  suCredit: Yup.number().required('SU credit is required').min(0, 'Credit must be positive'),
  ectsCredit: Yup.number().required('ECTS credit is required').min(0, 'Credit must be positive'),
  faculty: Yup.string().required('Faculty is required'),
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CourseManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<string[]>({
    queryKey: ['subjects'],
    queryFn: () => apiService.courses.getSubjects(),
  });

  // Fetch all courses by subject and course code
  useEffect(() => {
    const fetchAllCourses = async () => {
      if (!subjects.length) return;
      
      const coursesPromises: Promise<Course>[] = [];
      
      for (const subject of subjects) {
        try {
          const courseCodes = await apiService.courses.getCourseCodesBySubject(subject);
          
          for (const courseCode of courseCodes) {
            coursesPromises.push(apiService.courses.getCourse(subject, courseCode));
          }
        } catch (error) {
          console.error(`Error fetching course codes for ${subject}:`, error);
        }
      }
      
      try {
        const fetchedCourses = await Promise.all(coursesPromises);
        setAllCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    fetchAllCourses();
  }, [subjects]);

  const addCourseMutation = useMutation({
    mutationFn: (course: Partial<Course>) => adminApi.addCourse(course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addCourseFormik.resetForm();
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (course: Partial<Course>) => {
      if (!editingCourse?.courseId) throw new Error('Course ID is required');
      return adminApi.updateCourse(editingCourse.courseId, course);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const addCourseFormik = useFormik({
    initialValues: {
      subject: '',
      courseCode: '',
      courseNameEn: '',
      courseNameTr: '',
      suCredit: 0,
      ectsCredit: 0,
      engineeringEcts: 0,
      basicScienceEcts: 0,
      contentEn: '',
      contentTr: '',
      linkEn: '',
      linkTr: '',
      faculty: 'FENS' as 'FENS' | 'FASS' | 'SL' | 'FMAN',
      courseStatus: true,
    },
    validationSchema: courseValidationSchema,
    onSubmit: (values) => {
      if (editingCourse) {
        updateCourseMutation.mutate(values);
      } else {
        addCourseMutation.mutate(values);
      }
    },
  });

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    addCourseFormik.setValues({
      subject: course.subject,
      courseCode: course.courseCode,
      courseNameEn: course.courseNameEn,
      courseNameTr: course.courseNameTr,
      suCredit: course.suCredit,
      ectsCredit: course.ectsCredit,
      engineeringEcts: course.engineeringEcts || 0,
      basicScienceEcts: course.basicScienceEcts || 0,
      contentEn: course.contentEn || '',
      contentTr: course.contentTr || '',
      linkEn: course.linkEn || '',
      linkTr: course.linkTr || '',
      faculty: course.faculty || 'FENS',
      courseStatus: course.courseStatus,
    });
    setTabValue(0);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Management
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="course management tabs">
            <Tab label={editingCourse ? "Edit Course" : "Add Course"} />
            <Tab label="Course List" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={addCourseFormik.handleSubmit}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="subject"
                      name="subject"
                      label="Subject"
                      value={addCourseFormik.values.subject}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.subject && Boolean(addCourseFormik.errors.subject)}
                      helperText={addCourseFormik.touched.subject && addCourseFormik.errors.subject}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="courseCode"
                      name="courseCode"
                      label="Course Code"
                      value={addCourseFormik.values.courseCode}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.courseCode && Boolean(addCourseFormik.errors.courseCode)}
                      helperText={addCourseFormik.touched.courseCode && addCourseFormik.errors.courseCode}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="courseNameEn"
                      name="courseNameEn"
                      label="Course Name (English)"
                      value={addCourseFormik.values.courseNameEn}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.courseNameEn && Boolean(addCourseFormik.errors.courseNameEn)}
                      helperText={addCourseFormik.touched.courseNameEn && addCourseFormik.errors.courseNameEn}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="courseNameTr"
                      name="courseNameTr"
                      label="Course Name (Turkish)"
                      value={addCourseFormik.values.courseNameTr}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.courseNameTr && Boolean(addCourseFormik.errors.courseNameTr)}
                      helperText={addCourseFormik.touched.courseNameTr && addCourseFormik.errors.courseNameTr}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="suCredit"
                      name="suCredit"
                      label="SU Credit"
                      type="number"
                      value={addCourseFormik.values.suCredit}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.suCredit && Boolean(addCourseFormik.errors.suCredit)}
                      helperText={addCourseFormik.touched.suCredit && addCourseFormik.errors.suCredit}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="ectsCredit"
                      name="ectsCredit"
                      label="ECTS Credit"
                      type="number"
                      value={addCourseFormik.values.ectsCredit}
                      onChange={addCourseFormik.handleChange}
                      error={addCourseFormik.touched.ectsCredit && Boolean(addCourseFormik.errors.ectsCredit)}
                      helperText={addCourseFormik.touched.ectsCredit && addCourseFormik.errors.ectsCredit}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="faculty-label">Faculty</InputLabel>
                      <Select
                        labelId="faculty-label"
                        id="faculty"
                        name="faculty"
                        value={addCourseFormik.values.faculty}
                        label="Faculty"
                        onChange={addCourseFormik.handleChange}
                      >
                        <MenuItem value="FENS">FENS</MenuItem>
                        <MenuItem value="FASS">FASS</MenuItem>
                        <MenuItem value="SL">SL</MenuItem>
                        <MenuItem value="FMAN">FMAN</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>

                <Box>
                  <TextField
                    fullWidth
                    id="contentEn"
                    name="contentEn"
                    label="Content (English)"
                    multiline
                    rows={4}
                    value={addCourseFormik.values.contentEn}
                    onChange={addCourseFormik.handleChange}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    id="contentTr"
                    name="contentTr"
                    label="Content (Turkish)"
                    multiline
                    rows={4}
                    value={addCourseFormik.values.contentTr}
                    onChange={addCourseFormik.handleChange}
                  />
                </Box>
              </Stack>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addCourseMutation.isPending || updateCourseMutation.isPending}
                  startIcon={<AddIcon />}
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </Button>
                {editingCourse && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingCourse(null);
                      addCourseFormik.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {(addCourseMutation.isError || updateCourseMutation.isError) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {addCourseMutation.error?.message || updateCourseMutation.error?.message || 'An error occurred'}
                </Alert>
              )}

              {(addCourseMutation.isSuccess || updateCourseMutation.isSuccess) && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {editingCourse ? 'Course updated successfully!' : 'Course added successfully!'}
                </Alert>
              )}
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {isLoadingSubjects ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Name (EN)</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Faculty</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allCourses.map((course: Course) => (
                      <TableRow key={course.courseId}>
                        <TableCell>{course.courseId}</TableCell>
                        <TableCell>{course.subject}</TableCell>
                        <TableCell>{course.courseCode}</TableCell>
                        <TableCell>{course.courseNameEn}</TableCell>
                        <TableCell>{course.suCredit} / {course.ectsCredit}</TableCell>
                        <TableCell>{course.faculty || '-'}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditCourse(course)}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
} 