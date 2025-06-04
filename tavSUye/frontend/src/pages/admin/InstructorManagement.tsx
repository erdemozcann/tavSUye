import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import apiService, { adminApi } from '../../services/api';
import type { Instructor } from '../../types';

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
      id={`instructor-tabpanel-${index}`}
      aria-labelledby={`instructor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const instructorValidationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  title: yup.string().required('Title is required'),
  department: yup.string().required('Department is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export default function InstructorManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: instructors, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: () => apiService.instructors.getInstructors(),
  });

  const addInstructorMutation = useMutation({
    mutationFn: (instructor: Partial<Instructor>) => adminApi.addInstructor(instructor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      addInstructorFormik.resetForm();
    },
  });

  const updateInstructorMutation = useMutation({
    mutationFn: (instructor: Partial<Instructor>) => {
      if (!editingInstructor?.instructorId) throw new Error('Instructor ID is required');
      return adminApi.updateInstructor(editingInstructor.instructorId, instructor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      setEditingInstructor(null);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => adminApi.deleteInstructorComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorComments'] });
      setDeleteConfirmOpen(false);
      setDeletingCommentId(null);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const addInstructorFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      title: '',
      department: '',
      email: '',
      website: '',
      office: '',
      profileImage: '',
    },
    validationSchema: instructorValidationSchema,
    onSubmit: (values) => {
      if (editingInstructor) {
        updateInstructorMutation.mutate(values);
      } else {
        addInstructorMutation.mutate(values);
      }
    },
  });

  const handleEditInstructor = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    addInstructorFormik.setValues({
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      title: instructor.title,
      department: instructor.department,
      email: instructor.email,
      website: instructor.website || '',
      office: instructor.office || '',
      profileImage: instructor.profileImage || '',
    });
    setTabValue(0);
  };

  const handleDeleteComment = (commentId: number) => {
    setDeletingCommentId(commentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = () => {
    if (deletingCommentId) {
      deleteCommentMutation.mutate(deletingCommentId);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Instructor Management
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="instructor management tabs">
            <Tab label={editingInstructor ? "Edit Instructor" : "Add Instructor"} />
            <Tab label="Instructor List" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={addInstructorFormik.handleSubmit}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      value={addInstructorFormik.values.firstName}
                      onChange={addInstructorFormik.handleChange}
                      error={addInstructorFormik.touched.firstName && Boolean(addInstructorFormik.errors.firstName)}
                      helperText={addInstructorFormik.touched.firstName && addInstructorFormik.errors.firstName}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      value={addInstructorFormik.values.lastName}
                      onChange={addInstructorFormik.handleChange}
                      error={addInstructorFormik.touched.lastName && Boolean(addInstructorFormik.errors.lastName)}
                      helperText={addInstructorFormik.touched.lastName && addInstructorFormik.errors.lastName}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="title"
                      name="title"
                      label="Title"
                      value={addInstructorFormik.values.title}
                      onChange={addInstructorFormik.handleChange}
                      error={addInstructorFormik.touched.title && Boolean(addInstructorFormik.errors.title)}
                      helperText={addInstructorFormik.touched.title && addInstructorFormik.errors.title}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="department"
                      name="department"
                      label="Department"
                      value={addInstructorFormik.values.department}
                      onChange={addInstructorFormik.handleChange}
                      error={addInstructorFormik.touched.department && Boolean(addInstructorFormik.errors.department)}
                      helperText={addInstructorFormik.touched.department && addInstructorFormik.errors.department}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      value={addInstructorFormik.values.email}
                      onChange={addInstructorFormik.handleChange}
                      error={addInstructorFormik.touched.email && Boolean(addInstructorFormik.errors.email)}
                      helperText={addInstructorFormik.touched.email && addInstructorFormik.errors.email}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="website"
                      name="website"
                      label="Website"
                      value={addInstructorFormik.values.website}
                      onChange={addInstructorFormik.handleChange}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="office"
                      name="office"
                      label="Office"
                      value={addInstructorFormik.values.office}
                      onChange={addInstructorFormik.handleChange}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="profileImage"
                      name="profileImage"
                      label="Profile Image URL"
                      value={addInstructorFormik.values.profileImage}
                      onChange={addInstructorFormik.handleChange}
                    />
                  </Box>
                </Stack>
              </Stack>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addInstructorMutation.isPending || updateInstructorMutation.isPending}
                  startIcon={<AddIcon />}
                >
                  {editingInstructor ? 'Update Instructor' : 'Add Instructor'}
                </Button>
                {editingInstructor && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingInstructor(null);
                      addInstructorFormik.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {(addInstructorMutation.isError || updateInstructorMutation.isError) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {addInstructorMutation.error?.message || updateInstructorMutation.error?.message || 'An error occurred'}
                </Alert>
              )}

              {(addInstructorMutation.isSuccess || updateInstructorMutation.isSuccess) && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {editingInstructor ? 'Instructor updated successfully!' : 'Instructor added successfully!'}
                </Alert>
              )}
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {instructorsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instructors?.map((instructor) => (
                      <TableRow key={instructor.instructorId}>
                        <TableCell>{instructor.instructorId}</TableCell>
                        <TableCell>{`${instructor.firstName} ${instructor.lastName}`}</TableCell>
                        <TableCell>{instructor.title}</TableCell>
                        <TableCell>{instructor.department}</TableCell>
                        <TableCell>{instructor.email}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditInstructor(instructor)}
                          >
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

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteComment} 
            color="error" 
            variant="contained"
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 