import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';
import type { CourseComment, InstructorComment } from '../../types';

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
      id={`comment-tabpanel-${index}`}
      aria-labelledby={`comment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for development purposes
const mockCourseComments: CourseComment[] = [
  {
    commentId: 1,
    courseId: 101,
    userId: 201,
    username: 'john.doe',
    content: 'This course was very challenging but rewarding.',
    rating: 4,
    difficulty: 4,
    attendance: 'MANDATORY',
    textbook: 'REQUIRED',
    grade: 'A',
    term: 'Fall 2023',
    likes: 15,
    dislikes: 2,
    createdAt: '2023-11-15T10:30:00Z',
    isReported: true,
    reportCount: 3,
  },
  {
    commentId: 2,
    courseId: 102,
    userId: 202,
    username: 'jane.smith',
    content: 'The professor was excellent and very helpful.',
    rating: 5,
    difficulty: 3,
    attendance: 'OPTIONAL',
    textbook: 'RECOMMENDED',
    grade: 'B+',
    term: 'Spring 2023',
    likes: 8,
    dislikes: 0,
    createdAt: '2023-09-20T14:45:00Z',
    isReported: false,
    reportCount: 0,
  },
];

const mockInstructorComments: InstructorComment[] = [
  {
    commentId: 1,
    instructorId: 301,
    userId: 201,
    username: 'john.doe',
    content: 'Great instructor, very knowledgeable and approachable.',
    rating: 5,
    helpfulness: 5,
    clarity: 4,
    likes: 12,
    dislikes: 1,
    createdAt: '2023-10-05T09:15:00Z',
    isReported: true,
    reportCount: 2,
  },
  {
    commentId: 2,
    instructorId: 302,
    userId: 203,
    username: 'alex.wilson',
    content: 'The instructor was always available during office hours.',
    rating: 4,
    helpfulness: 4,
    clarity: 3,
    likes: 6,
    dislikes: 1,
    createdAt: '2023-08-12T16:30:00Z',
    isReported: false,
    reportCount: 0,
  },
];

export default function CommentModeration() {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingComment, setDeletingComment] = useState<{ id: number, type: 'course' | 'instructor' } | null>(null);
  const queryClient = useQueryClient();

  // In a real implementation, these would be API calls
  const { data: courseComments = mockCourseComments, isLoading: courseCommentsLoading } = useQuery<CourseComment[]>({
    queryKey: ['courseComments', 'moderation'],
    queryFn: () => Promise.resolve(mockCourseComments),
    enabled: tabValue === 0,
  });

  const { data: instructorComments = mockInstructorComments, isLoading: instructorCommentsLoading } = useQuery<InstructorComment[]>({
    queryKey: ['instructorComments', 'moderation'],
    queryFn: () => Promise.resolve(mockInstructorComments),
    enabled: tabValue === 1,
  });

  const deleteCourseCommentMutation = useMutation({
    mutationFn: (commentId: number) => adminApi.deleteCourseComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseComments'] });
      setDeleteConfirmOpen(false);
      setDeletingComment(null);
    },
  });

  const deleteInstructorCommentMutation = useMutation({
    mutationFn: (commentId: number) => adminApi.deleteInstructorComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorComments'] });
      setDeleteConfirmOpen(false);
      setDeletingComment(null);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteComment = (id: number, type: 'course' | 'instructor') => {
    setDeletingComment({ id, type });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = () => {
    if (deletingComment) {
      if (deletingComment.type === 'course') {
        deleteCourseCommentMutation.mutate(deletingComment.id);
      } else {
        deleteInstructorCommentMutation.mutate(deletingComment.id);
      }
    }
  };

  const filteredCourseComments = courseComments.filter(comment => 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstructorComments = instructorComments.filter(comment => 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = tabValue === 0 ? courseCommentsLoading : instructorCommentsLoading;
  const isPending = deleteCourseCommentMutation.isPending || deleteInstructorCommentMutation.isPending;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Comment Moderation
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="comment moderation tabs">
            <Tab label="Course Comments" />
            <Tab label="Instructor Comments" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search comments by content or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TabPanel value={tabValue} index={0}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Course</TableCell>
                          <TableCell>Comment</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCourseComments
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((comment) => (
                            <TableRow key={comment.commentId}>
                              <TableCell>{comment.commentId}</TableCell>
                              <TableCell>{comment.username}</TableCell>
                              <TableCell>Course #{comment.courseId}</TableCell>
                              <TableCell sx={{ maxWidth: 300 }}>
                                <Typography noWrap>{comment.content}</Typography>
                              </TableCell>
                              <TableCell>{comment.rating}/5</TableCell>
                              <TableCell>
                                {comment.isReported ? (
                                  <Chip 
                                    icon={<FlagIcon fontSize="small" />} 
                                    label={`Reported (${comment.reportCount})`} 
                                    color="error" 
                                    size="small" 
                                  />
                                ) : (
                                  <Chip 
                                    icon={<CheckCircleIcon fontSize="small" />} 
                                    label="OK" 
                                    color="success" 
                                    size="small" 
                                  />
                                )}
                              </TableCell>
                              <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteComment(comment.commentId, 'course')}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCourseComments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Instructor</TableCell>
                          <TableCell>Comment</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredInstructorComments
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((comment) => (
                            <TableRow key={comment.commentId}>
                              <TableCell>{comment.commentId}</TableCell>
                              <TableCell>{comment.username}</TableCell>
                              <TableCell>Instructor #{comment.instructorId}</TableCell>
                              <TableCell sx={{ maxWidth: 300 }}>
                                <Typography noWrap>{comment.content}</Typography>
                              </TableCell>
                              <TableCell>{comment.rating}/5</TableCell>
                              <TableCell>
                                {comment.isReported ? (
                                  <Chip 
                                    icon={<FlagIcon fontSize="small" />} 
                                    label={`Reported (${comment.reportCount})`} 
                                    color="error" 
                                    size="small" 
                                  />
                                ) : (
                                  <Chip 
                                    icon={<CheckCircleIcon fontSize="small" />} 
                                    label="OK" 
                                    color="success" 
                                    size="small" 
                                  />
                                )}
                              </TableCell>
                              <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteComment(comment.commentId, 'instructor')}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredInstructorComments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </TabPanel>
          </Box>
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
            disabled={isPending}
          >
            {isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 