import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Stack,
  Grid,
} from '@mui/material';
import {
  School,
  Person,
  ThumbUp,
  ThumbDown,
  Comment,
  Star,
  Add,
  Remove,
  MoreVert,
  Reply,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Edit,
  Delete,
  Block,
  ArrowBack,
} from '@mui/icons-material';
import apiService from '../services/api';
import type { Instructor, InstructorComment } from '../types';
import type { RootState } from '../store';

// Recursive component for rendering instructor comments with unlimited nesting
interface InstructorCommentItemProps {
  comment: InstructorComment;
  allComments: InstructorComment[];
  level: number;
  onReply: (commentId: number) => void;
  onRate: (commentId: number, isLike: boolean) => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, content: string, anonymous: boolean) => void;
  onBan: (comment: InstructorComment) => void;
  currentUser: any;
  commentStats: { [key: number]: { likes: number; dislikes: number } };
  userRatings: { [key: number]: boolean | null };
}

function InstructorCommentItem({ comment, allComments, level, onReply, onRate, onDelete, onEdit, onBan, currentUser, commentStats, userRatings }: InstructorCommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editAnonymous, setEditAnonymous] = useState(comment.isAnonymous || false);
  const replies = allComments.filter(reply => reply.parentCommentId === comment.commentId);
  const maxLevel = 5; // Prevent infinite nesting
  
  // Count total replies recursively for display
  const countTotalReplies = (commentId: number): number => {
    const directReplies = allComments.filter(reply => reply.parentCommentId === commentId);
    return directReplies.reduce((total, reply) => total + 1 + countTotalReplies(reply.commentId), 0);
  };
  
  const totalReplies = countTotalReplies(comment.commentId);
  
  // Get stats for this comment
  const stats = commentStats[comment.commentId] || { likes: 0, dislikes: 0 };
  const userRating = userRatings[comment.commentId];
  const netScore = stats.likes - stats.dislikes;
  
  // Check if user can edit/delete this comment
  console.log('Debug canEdit/canDelete with username:', {
    currentUser: currentUser,
    currentUsername: currentUser?.username,
    commentUsername: comment.user?.name ? `${comment.user.name} ${comment.user.surname || ''}` : comment.username,
    commentUserId: comment.userId,
    userRole: currentUser?.role,
    comment: comment
  });
  
  // Use username for comparison instead of userId
  const commentUsername = comment.username || `${comment.user?.name || ''} ${comment.user?.surname || ''}`.trim();
  const canEdit = currentUser && currentUser.username === commentUsername;
  const canDelete = currentUser && (
    currentUser.role === 'ADMIN' || 
    currentUser.username === commentUsername
  );
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    onDelete(comment.commentId);
    handleMenuClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setEditAnonymous(comment.isAnonymous || false);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.commentId, editContent.trim(), editAnonymous);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditAnonymous(comment.isAnonymous || false);
  };

  const handleRate = (isLike: boolean) => {
    // If user already rated the same way, remove the rating
    if (userRating === isLike) {
      onRate(comment.commentId, isLike); // The parent will handle the logic
    } else {
      // Rate or change rating
      onRate(comment.commentId, isLike);
    }
  };

  return (
    <Box sx={{ ml: level * 4, mt: level > 0 ? 2 : 0 }}>
      {level > 0 && (
        <Box sx={{ borderLeft: '2px solid #e0e0e0', pl: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {/* Collapse/Expand button for nested comments */}
            {replies.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setIsCollapsed(!isCollapsed)}
                sx={{ mr: 1, p: 0.5 }}
              >
                {isCollapsed ? <Add /> : <Remove />}
              </IconButton>
            )}
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {comment.isAnonymous ? 'A' : (comment.user?.name?.[0] || comment.username?.[0] || 'U')}
            </Avatar>
            <Typography variant="subtitle2">
              {comment.isAnonymous ? 'Anonymous' : (comment.user?.name ? `${comment.user.name} ${comment.user.surname || ''}` : comment.username || 'User')}
              {isCollapsed && totalReplies > 0 && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'} hidden)
                </Typography>
              )}
              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                • {`${new Date(comment.createdAt).toLocaleDateString()} ${new Date(comment.createdAt).toLocaleTimeString().slice(0, -3)}`}
              </Typography>
            </Typography>
          </Box>
          {!isCollapsed && (
            <>
              {isEditing ? (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editAnonymous}
                        onChange={(e) => setEditAnonymous(e.target.checked)}
                      />
                    }
                    label="Anonymous"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      size="small" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {comment.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" onClick={() => onReply(comment.commentId)}>
                      Reply
                    </Button>
                    {/* Rating buttons for nested comments */}
                    <IconButton size="small" onClick={() => handleRate(true)} color={userRating === true ? "primary" : "inherit"}>
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{stats.likes}</Typography>
                    <IconButton size="small" onClick={() => handleRate(false)} color={userRating === false ? "error" : "inherit"}>
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{stats.dislikes}</Typography>
                    <Typography variant="caption" color={netScore > 0 ? 'success.main' : netScore < 0 ? 'error.main' : 'text.secondary'}>
                      ({netScore > 0 ? `+${netScore}` : netScore})
                    </Typography>
                    {canEdit && (
                      <IconButton size="small" onClick={handleEdit}>
                        <Edit />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" onClick={handleDelete}>
                        <Delete />
                      </IconButton>
                    )}
                    {isAdmin && currentUser.username !== commentUsername && (
                      <IconButton size="small" onClick={() => onBan(comment)} color="warning">
                        <Block />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      )}
      
      {level === 0 && (
        <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Collapse/Expand button for top-level comments */}
              {replies.length > 0 && (
                <IconButton
                  size="small"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{ mr: 1 }}
                >
                  {isCollapsed ? <Add /> : <Remove />}
                </IconButton>
              )}
              <ListItemAvatar>
                <Avatar>
                  {comment.isAnonymous ? 'A' : (comment.user?.name?.[0] || comment.username?.[0] || 'U')}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {comment.isAnonymous ? 'Anonymous' : (comment.user?.name ? `${comment.user.name} ${comment.user.surname || ''}` : comment.username || 'User')}
                    </Typography>
                    {isCollapsed && totalReplies > 0 && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'} hidden)
                      </Typography>
                    )}
                  </Box>
                }
                secondary={`${new Date(comment.createdAt).toLocaleDateString()} ${new Date(comment.createdAt).toLocaleTimeString().slice(0, -3)}`}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Menu for edit/delete options */}
              {(canEdit || canDelete) && (
                <>
                  <Tooltip title="More options">
                    <IconButton
                      size="small"
                      onClick={handleMenuOpen}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                  >
                    {canEdit && (
                      <MenuItem onClick={handleEdit}>
                        <Edit sx={{ mr: 1 }} />
                        Edit Comment
                      </MenuItem>
                    )}
                    {canDelete && (
                      <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <Delete sx={{ mr: 1 }} />
                        Delete Comment
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>
          </Box>
          {!isCollapsed && (
            <>
              {isEditing ? (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editAnonymous}
                        onChange={(e) => setEditAnonymous(e.target.checked)}
                      />
                    }
                    label="Anonymous"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      size="small" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {comment.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" onClick={() => onReply(comment.commentId)}>
                      Reply
                    </Button>
                    {/* Rating buttons for level 0 comments */}
                    <IconButton size="small" onClick={() => handleRate(true)} color={userRating === true ? "primary" : "inherit"}>
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{stats.likes}</Typography>
                    <IconButton size="small" onClick={() => handleRate(false)} color={userRating === false ? "error" : "inherit"}>
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{stats.dislikes}</Typography>
                    <Typography variant="caption" color={netScore > 0 ? 'success.main' : netScore < 0 ? 'error.main' : 'text.secondary'}>
                      ({netScore > 0 ? `+${netScore}` : netScore})
                    </Typography>
                    {canEdit && (
                      <IconButton size="small" onClick={handleEdit}>
                        <Edit />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" onClick={handleDelete}>
                        <Delete />
                      </IconButton>
                    )}
                    {isAdmin && currentUser.username !== commentUsername && (
                      <IconButton size="small" onClick={() => onBan(comment)} color="warning">
                        <Block />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </ListItem>
      )}
      
      {/* Recursively render replies - only if not collapsed */}
      {!isCollapsed && replies.length > 0 && level < maxLevel && (
        <Box>
          {replies.map((reply) => (
            <InstructorCommentItem
              key={reply.commentId}
              comment={reply}
              allComments={allComments}
              level={level + 1}
              onReply={onReply}
              onRate={onRate}
              onDelete={onDelete}
              onEdit={onEdit}
              onBan={onBan}
              currentUser={currentUser}
              commentStats={commentStats}
              userRatings={userRatings}
            />
          ))}
        </Box>
      )}
      
      {level === 0 && <Divider sx={{ my: 2, width: '100%' }} />}
    </Box>
  );
}

export default function InstructorDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [commentStats, setCommentStats] = useState<{ [key: number]: { likes: number; dislikes: number } }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: boolean | null }>({});
  const [commentError, setCommentError] = useState('');
  
  // Ban user states
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');
  
  // Edit instructor states
  const [editInstructorDialogOpen, setEditInstructorDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAboutTr, setEditAboutTr] = useState('');
  const [editAboutEn, setEditAboutEn] = useState('');
  const [editLinkTr, setEditLinkTr] = useState('');
  const [editLinkEn, setEditLinkEn] = useState('');
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Validate the ID parameter
  const instructorId = id ? parseInt(id) : undefined;
  const isValidId = !isNaN(Number(instructorId)) && instructorId !== undefined && instructorId > 0;

  // Debug log when component loads
  useEffect(() => {
    console.log(`InstructorDetail component loaded with id: ${id}, parsed as: ${instructorId}, valid: ${isValidId}`);
    
    // If ID is invalid, show error message
    if (!isValidId) {
      console.error(`Invalid instructor ID: ${id}`);
    }
  }, [id, instructorId, isValidId]);

  const { data: instructor, isLoading: instructorLoading, error: instructorError } = useQuery<Instructor>({
    queryKey: ['instructor', instructorId],
    queryFn: async () => {
      if (!instructorId) throw new Error('Instructor ID is required');
      const instructorData = await apiService.instructor.getInstructorDetails(instructorId!);
      
      // Log the visit as specified in the API documentation
      try {
        await apiService.instructor.logInstructorVisit(instructorId!);
        console.log('Instructor visit logged successfully');
      } catch (logError) {
        console.warn('Failed to log instructor visit:', logError);
        // Don't throw error for logging failure
      }
      
      return instructorData;
    },
    enabled: !!instructorId,
  });

  // Debug log when instructor data changes
  useEffect(() => {
    if (instructor) {
      console.log('Instructor data loaded:', instructor);
    }
    if (instructorError) {
      console.error('Error loading instructor:', instructorError);
    }
  }, [instructor, instructorError]);

  const { data: comments = [], isLoading: commentsLoading } = useQuery<InstructorComment[]>({
    queryKey: ['instructorComments', instructorId],
    queryFn: () => apiService.instructor.getComments(instructor?.instructorId!),
    enabled: !!instructor && isValidId,
  });

  // Fetch comment stats and user ratings when comments are loaded
  useEffect(() => {
    if (comments && comments.length > 0) {
      const fetchStatsAndRatings = async () => {
        const statsPromises = comments.map(comment => 
          apiService.instructor.getCommentStats(comment.commentId)
            .then(stats => ({ commentId: comment.commentId, stats }))
            .catch(() => ({ commentId: comment.commentId, stats: { likes: 0, dislikes: 0 } }))
        );
        
        const userRatingsPromises = comments.map(comment => 
          apiService.instructor.getUserRating(comment.commentId)
            .then(rating => ({ commentId: comment.commentId, rating }))
            .catch(() => ({ commentId: comment.commentId, rating: null }))
        );

        const [statsResults, ratingsResults] = await Promise.all([
          Promise.all(statsPromises),
          Promise.all(userRatingsPromises)
        ]);

        const newStats: { [key: number]: { likes: number; dislikes: number } } = {};
        const newRatings: { [key: number]: boolean | null } = {};

        statsResults.forEach(({ commentId, stats }) => {
          newStats[commentId] = stats;
        });

        ratingsResults.forEach(({ commentId, rating }) => {
          newRatings[commentId] = rating;
        });

        setCommentStats(newStats);
        setUserRatings(newRatings);
      };

      fetchStatsAndRatings();
    }
  }, [comments]);

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => apiService.instructor.deleteComment(commentId),
    onSuccess: async () => {
      // Refresh comments and their stats
      await queryClient.invalidateQueries({ queryKey: ['instructorComments', instructorId] });
      await queryClient.refetchQueries({ queryKey: ['instructorComments', instructorId] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      setCommentError('Failed to delete comment. Please try again.');
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content, anonymous }: { commentId: number; content: string; anonymous: boolean }) => 
      apiService.instructor.updateComment(commentId, { content, isAnonymous: anonymous }),
    onSuccess: async () => {
      // Refresh comments and their stats
      await queryClient.invalidateQueries({ queryKey: ['instructorComments', instructorId] });
      await queryClient.refetchQueries({ queryKey: ['instructorComments', instructorId] });
    },
    onError: (error) => {
      console.error('Failed to edit comment:', error);
      setCommentError('Failed to edit comment. Please try again.');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (comment: Partial<InstructorComment>) =>
      apiService.instructor.addComment(instructor?.instructorId!, comment),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['instructorComments', instructorId] });
      await queryClient.refetchQueries({ queryKey: ['instructorComments', instructorId] });
      setCommentDialogOpen(false);
      setNewComment('');
      setIsAnonymous(false);
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
      setCommentError('Failed to add comment. Please try again.');
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: (reply: Partial<InstructorComment>) => 
      apiService.instructor.addComment(instructor?.instructorId!, reply),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['instructorComments', instructorId] });
      await queryClient.refetchQueries({ queryKey: ['instructorComments', instructorId] });
      setReplyDialogOpen(false);
      setReplyContent('');
      setReplyAnonymous(false);
      setReplyToCommentId(null);
    },
    onError: (error) => {
      console.error('Failed to add reply:', error);
      setCommentError('Failed to add reply. Please try again.');
    },
  });

  const rateCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLike }: { commentId: number; isLike: boolean }) => {
      const currentRating = userRatings[commentId];
      
      // If user already rated the same way, remove the rating
      if (currentRating === isLike) {
        return apiService.instructor.removeRating(commentId);
      } else {
        // Rate or change rating
        return apiService.instructor.rateComment(commentId, isLike);
      }
    },
    onSuccess: async (_, { commentId, isLike }) => {
      // Update local state immediately for better UX
      const currentRating = userRatings[commentId];
      const currentStats = commentStats[commentId] || { likes: 0, dislikes: 0 };
      
      let newRating: boolean | null;
      let newStats = { ...currentStats };
      
      if (currentRating === isLike) {
        // Removing rating
        newRating = null;
        if (isLike) {
          newStats.likes = Math.max(0, newStats.likes - 1);
        } else {
          newStats.dislikes = Math.max(0, newStats.dislikes - 1);
        }
      } else {
        // Adding or changing rating
        newRating = isLike;
        
        // Remove previous rating if exists
        if (currentRating !== null) {
          if (currentRating) {
            newStats.likes = Math.max(0, newStats.likes - 1);
          } else {
            newStats.dislikes = Math.max(0, newStats.dislikes - 1);
          }
        }
        
        // Add new rating
        if (isLike) {
          newStats.likes += 1;
        } else {
          newStats.dislikes += 1;
        }
      }
      
      setUserRatings(prev => ({ ...prev, [commentId]: newRating }));
      setCommentStats(prev => ({ ...prev, [commentId]: newStats }));
      
      // Also invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['instructorComments', instructorId] });
    },
    onError: (error) => {
      console.error('Failed to rate comment:', error);
      setCommentError('Failed to rate comment. Please try again.');
    },
  });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) => 
      apiService.admin.banUser(userId, reason),
    onSuccess: () => {
      setBanDialogOpen(false);
      setBanUserId(null);
      setBanUsername('');
      setBanReason('');
      // Optionally show success message
    },
    onError: (error: any) => {
      console.error('Error banning user:', error);
      // Optionally show error message
    },
  });

  const editInstructorMutation = useMutation({
    mutationFn: (instructorData: Partial<Instructor>) => 
      apiService.admin.updateInstructor(instructorId!, instructorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', instructorId] });
      setEditInstructorDialogOpen(false);
      // Clear form
      setEditName('');
      setEditSurname('');
      setEditDepartment('');
      setEditImageUrl('');
      setEditAboutTr('');
      setEditAboutEn('');
      setEditLinkTr('');
      setEditLinkEn('');
    },
    onError: (error: any) => {
      console.error('Error updating instructor:', error);
      // Optionally show error message
    },
  });

  const handleGoBack = () => {
    navigate('/instructors');
  };

  // Show error if ID is invalid
  if (!isValidId) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid instructor ID. The ID must be a positive number.
          </Alert>
          <Button 
            startIcon={<ArrowBack />} 
            variant="contained" 
            onClick={handleGoBack}
          >
            Back to Instructors
          </Button>
        </Paper>
      </Container>
    );
  }

  if (instructorLoading) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading instructor details...</Typography>
        </Paper>
      </Container>
    );
  }

  if (instructorError) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading instructor data. The instructor may not exist or there was a server error.
          </Alert>
          <Button 
            startIcon={<ArrowBack />} 
            variant="contained" 
            onClick={handleGoBack}
          >
            Back to Instructors
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!instructor) {
    return (
      <Container>
        <Paper sx={{ p: 3, my: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Instructor not found.
          </Alert>
          <Button 
            startIcon={<ArrowBack />} 
            variant="contained" 
            onClick={handleGoBack}
          >
            Back to Instructors
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleAddComment = () => {
    addCommentMutation.mutate({
      content: newComment,
      isAnonymous,
    });
  };

  const handleBanUser = (comment: InstructorComment) => {
    setBanUserId(comment.userId);
    setBanUsername(comment.username || 'Anonymous');
    setBanDialogOpen(true);
  };

  const handleConfirmBan = () => {
    if (banUserId && banReason.trim()) {
      banUserMutation.mutate({ userId: banUserId, reason: banReason.trim() });
    }
  };

  const handleEditInstructor = () => {
    if (instructor) {
      setEditName(instructor.name || instructor.firstName || '');
      setEditSurname(instructor.surname || instructor.lastName || '');
      setEditDepartment(instructor.department || '');
      setEditImageUrl(instructor.imageUrl || instructor.profileImage || '');
      setEditAboutTr(instructor.aboutTr || '');
      setEditAboutEn(instructor.aboutEn || '');
      setEditLinkTr(instructor.linkTr || '');
      setEditLinkEn(instructor.linkEn || '');
      setEditInstructorDialogOpen(true);
    }
  };

  const handleUpdateInstructor = () => {
    const instructorData = {
      name: editName.trim(),
      surname: editSurname.trim(),
      department: editDepartment.trim(),
      imageUrl: editImageUrl.trim(),
      aboutTr: editAboutTr.trim(),
      aboutEn: editAboutEn.trim(),
      linkTr: editLinkTr.trim(),
      linkEn: editLinkEn.trim(),
    };

    editInstructorMutation.mutate(instructorData);
  };

  const instructorComments = Array.isArray(comments) ? comments : [];

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button 
            startIcon={<ArrowBack />} 
            variant="outlined" 
            onClick={handleGoBack}
          >
            Back to Instructors
          </Button>
          {user?.role === 'ADMIN' && (
            <Button 
              startIcon={<Edit />} 
              variant="contained" 
              onClick={handleEditInstructor}
            >
              Edit Instructor
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={instructor.imageUrl || instructor.profileImage}
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                {(!instructor.imageUrl && !instructor.profileImage) ? 
                  (instructor.name || instructor.firstName || 'I')[0] : 
                  null
                }
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {instructor.name || instructor.firstName} {instructor.surname || instructor.lastName}
                </Typography>
                {instructor.title && (
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {instructor.title}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {instructor.department && (
                    <Chip
                      icon={<Person />}
                      label={instructor.department}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {instructor.email && (
                    <Chip
                      label={instructor.email}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            {instructor.aboutEn ? (
              <Typography variant="body1" paragraph>
                {instructor.aboutEn}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No English description available for this instructor.
              </Typography>
            )}
            
            {instructor.aboutTr && (
              <Typography variant="body1">
                {instructor.aboutTr}
              </Typography>
            )}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Comments and Reviews
              </Typography>
              <Button
                variant="contained"
                startIcon={<Comment />}
                onClick={() => setCommentDialogOpen(true)}
              >
                Add Comment
              </Button>
            </Box>
            
            {commentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List>
                {instructorComments.filter(comment => !comment.parentCommentId).map((comment) => (
                  <InstructorCommentItem
                    key={comment.commentId}
                    comment={comment}
                    allComments={instructorComments}
                    level={0}
                    onReply={(commentId) => {
                      setReplyToCommentId(commentId);
                      setReplyDialogOpen(true);
                    }}
                    onRate={(commentId, isLike) => rateCommentMutation.mutate({ commentId, isLike })}
                    onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
                    onEdit={(commentId, content, anonymous) => {
                      editCommentMutation.mutate({ commentId, content, anonymous });
                    }}
                    onBan={handleBanUser}
                    currentUser={user}
                    commentStats={commentStats}
                    userRatings={userRatings}
                  />
                ))}
                {instructorComments.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No comments yet. Be the first to add a comment!
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
            }
            label="Post anonymously"
          />
          
          {commentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {commentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddComment}
            variant="contained"
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Reply"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={replyAnonymous}
                onChange={(e) => setReplyAnonymous(e.target.checked)}
              />
            }
            label="Post anonymously"
          />
          
          {commentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {commentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              addReplyMutation.mutate({
                content: replyContent,
                isAnonymous: replyAnonymous,
                parentCommentId: replyToCommentId
              });
            }}
            variant="contained"
            disabled={!replyContent.trim() || addReplyMutation.isPending}
          >
            {addReplyMutation.isPending ? 'Posting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main' }}>
          <Block sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ban User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to ban user <strong>{banUsername}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This action will prevent the user from accessing the platform.
            </Typography>
            
            <TextField
              fullWidth
              label="Ban Reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              placeholder="Please provide a reason for banning this user..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmBan}
            variant="contained"
            color="warning"
            disabled={!banReason.trim() || banUserMutation.isPending}
            startIcon={<Block />}
          >
            {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Instructor Dialog */}
      <Dialog open={editInstructorDialogOpen} onClose={() => setEditInstructorDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
          Edit Instructor Information
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editSurname}
                  onChange={(e) => setEditSurname(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Profile Image URL"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="About (English)"
                  value={editAboutEn}
                  onChange={(e) => setEditAboutEn(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  placeholder="Instructor's biography and research interests in English..."
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="About (Turkish)"
                  value={editAboutTr}
                  onChange={(e) => setEditAboutTr(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  placeholder="Hoca hakkında bilgi ve araştırma alanları (Türkçe)..."
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Profile Link (English)"
                  value={editLinkEn}
                  onChange={(e) => setEditLinkEn(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/en/profile"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Profile Link (Turkish)"
                  value={editLinkTr}
                  onChange={(e) => setEditLinkTr(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/tr/profil"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditInstructorDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateInstructor}
            variant="contained"
            disabled={!editName.trim() || !editSurname.trim() || editInstructorMutation.isPending}
            startIcon={<Edit />}
          >
            {editInstructorMutation.isPending ? 'Updating...' : 'Update Instructor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
