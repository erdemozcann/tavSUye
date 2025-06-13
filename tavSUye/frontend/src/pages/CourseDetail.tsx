import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
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
  Tab,
  Tabs,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Alert,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  Switch,
} from '@mui/material';
import {
  School,
  Person,
  ThumbUp,
  ThumbDown,
  Comment,
  Star,
  CloudUpload,
  PictureAsPdf,
  InsertDriveFile,
  Download,
  Delete,
  FilePresent,
  Add,
  Remove,
  MoreVert,
  Reply,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Edit,
  Link,
  Block,
} from '@mui/icons-material';
import apiService, { noteApi } from '../services/api';
import type { Course, CourseComment, Note } from '../types';
import type { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Recursive component for rendering comments with unlimited nesting
interface CommentItemProps {
  comment: CourseComment;
  allComments: CourseComment[];
  level: number;
  onReply: (commentId: number) => void;
  onRate: (commentId: number, isLike: boolean) => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, content: string, anonymous: boolean, termTaken?: number | null, gradeReceived?: string | null) => void;
  onBan: (comment: CourseComment) => void;
  currentUser: any;
  commentStats: { [key: number]: { likes: number; dislikes: number } };
  userRatings: { [key: number]: boolean | null };
  formatTermForDisplay: (termCode: string) => string;
  courseStatus: boolean;
}

function CommentItem({ comment, allComments, level, onReply, onRate, onDelete, onEdit, onBan, currentUser, commentStats, userRatings, formatTermForDisplay, courseStatus }: CommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editAnonymous, setEditAnonymous] = useState(comment.anonymous || false);
  const [editTermYear, setEditTermYear] = useState('');
  const [editTermSeason, setEditTermSeason] = useState('');
  const [editGradeReceived, setEditGradeReceived] = useState('');
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
    commentUsername: comment.username,
    commentUserId: comment.userId,
    userRole: currentUser?.role,
    comment: comment
  });
  
  // Use username for comparison instead of userId
  const canEdit = currentUser && currentUser.username === comment.username;
  const canDelete = currentUser && (
    currentUser.role === 'ADMIN' || 
    currentUser.username === comment.username
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
    setEditAnonymous(comment.anonymous || false);
    
    // Parse existing term data
    if (comment.termTaken) {
      const termStr = comment.termTaken.toString();
      if (termStr.length === 6) {
        const year = termStr.substring(0, 4);
        const seasonCode = termStr.substring(4, 6);
        const season = seasonCode === '01' ? 'Fall' : seasonCode === '02' ? 'Spring' : 'Summer';
        setEditTermYear(year);
        setEditTermSeason(season);
      }
    } else {
      setEditTermYear('');
      setEditTermSeason('');
    }
    
    setEditGradeReceived(comment.gradeReceived || '');
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      // Validate that both year and season are provided together
      if ((editTermYear && !editTermSeason) || (!editTermYear && editTermSeason)) {
        alert('Please select both year and season, or leave both empty');
        return;
      }
      
      // Validate year if provided
      if (editTermYear && (parseInt(editTermYear) < 2000 || parseInt(editTermYear) > 2025)) {
        alert('Year must be between 2000 and 2025');
        return;
      }
      
      const formattedTerm = editTermYear && editTermSeason ? 
        parseInt(`${editTermYear}${editTermSeason === 'Fall' ? '01' : editTermSeason === 'Spring' ? '02' : '03'}`) : null;
      
      onEdit(comment.commentId, editContent.trim(), editAnonymous, formattedTerm, editGradeReceived || null);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditAnonymous(comment.anonymous || false);
    setEditTermYear('');
    setEditTermSeason('');
    setEditGradeReceived('');
  };

  const handleRate = (isLike: boolean) => {
    // If user already rated the same way, remove the rating
    if (userRating === isLike) {
      // Call remove rating API (this will be handled in the parent component)
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
              {comment.anonymous ? 'A' : (comment.username ? comment.username[0] : 'U')}
            </Avatar>
            <Typography variant="subtitle2">
              {comment.anonymous ? (
                // If anonymous and (current user is the comment owner OR user is admin), show username + Anonymous
                (currentUser && currentUser.username === comment.username) || (currentUser && currentUser.role === 'ADMIN') ? 
                  (comment.username || 'User') :
                  'Anonymous'
              ) : (
                // If not anonymous, show username normally
                comment.username || 'User'
              )}
              {comment.anonymous && ((currentUser && currentUser.username === comment.username) || (currentUser && currentUser.role === 'ADMIN')) && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  • Anonymous
                </Typography>
              )}
              {isCollapsed && totalReplies > 0 && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  • ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'} hidden)
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
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="Year"
                      value={editTermYear}
                      onChange={(e) => setEditTermYear(e.target.value)}
                      placeholder="e.g., 2021"
                      type="number"
                      inputProps={{ min: 2000, max: 2025 }}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <FormControl sx={{ flex: 1 }} size="small">
                      <InputLabel>Season</InputLabel>
                      <Select
                        value={editTermSeason}
                        onChange={(e) => setEditTermSeason(e.target.value)}
                        label="Season"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 150,
                              width: 100,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value="Fall">Fall</MenuItem>
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }} size="small">
                    <InputLabel>Grade Received</InputLabel>
                    <Select
                      value={editGradeReceived}
                      onChange={(e) => setEditGradeReceived(e.target.value)}
                      label="Grade Received"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 80,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="C+">C+</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="C-">C-</MenuItem>
                      <MenuItem value="D+">D+</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                      <MenuItem value="NA">NA</MenuItem>
                      <MenuItem value="S">S</MenuItem>
                      <MenuItem value="W">W</MenuItem>
                    </Select>
                  </FormControl>
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
                    {courseStatus ? (
                      <Button size="small" onClick={() => onReply(comment.commentId)}>
                        Reply
                      </Button>
                    ) : (
                      <Button size="small" disabled title="Replies are disabled for inactive courses">
                        Reply
                      </Button>
                    )}
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
                    {isAdmin && currentUser.username !== comment.username && (
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
                  {comment.anonymous ? 'A' : (comment.username ? comment.username[0] : 'U')}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {comment.anonymous ? (
                      // If anonymous and (current user is the comment owner OR user is admin), show username + Anonymous
                      (currentUser && currentUser.username === comment.username) || (currentUser && currentUser.role === 'ADMIN') ? 
                        (comment.username || 'User') :
                        'Anonymous'
                    ) : (
                      // If not anonymous, show username normally
                      comment.username || 'User'
                    )}
                    {comment.termTaken && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        • Term: {formatTermForDisplay(comment.termTaken.toString())}
                      </Typography>
                    )}
                    {comment.gradeReceived && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        • Grade: {comment.gradeReceived}
                      </Typography>
                    )}
                    {comment.anonymous && ((currentUser && currentUser.username === comment.username) || (currentUser && currentUser.role === 'ADMIN')) && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        • Anonymous
                      </Typography>
                    )}
                    {isCollapsed && totalReplies > 0 && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        • ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'} hidden)
                      </Typography>
                    )}
                    <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      • {`${new Date(comment.createdAt).toLocaleDateString()} ${new Date(comment.createdAt).toLocaleTimeString().slice(0, -3)}`}
                    </Typography>
                  </Typography>
                }
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
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="Year"
                      value={editTermYear}
                      onChange={(e) => setEditTermYear(e.target.value)}
                      placeholder="e.g., 2021"
                      type="number"
                      inputProps={{ min: 2000, max: 2025 }}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <FormControl sx={{ flex: 1 }} size="small">
                      <InputLabel>Season</InputLabel>
                      <Select
                        value={editTermSeason}
                        onChange={(e) => setEditTermSeason(e.target.value)}
                        label="Season"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 150,
                              width: 100,
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value="Fall">Fall</MenuItem>
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }} size="small">
                    <InputLabel>Grade Received</InputLabel>
                    <Select
                      value={editGradeReceived}
                      onChange={(e) => setEditGradeReceived(e.target.value)}
                      label="Grade Received"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 80,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="C+">C+</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="C-">C-</MenuItem>
                      <MenuItem value="D+">D+</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                      <MenuItem value="NA">NA</MenuItem>
                      <MenuItem value="S">S</MenuItem>
                      <MenuItem value="W">W</MenuItem>
                    </Select>
                  </FormControl>
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
                    {courseStatus ? (
                      <Button size="small" onClick={() => onReply(comment.commentId)}>
                        Reply
                      </Button>
                    ) : (
                      <Button size="small" disabled title="Replies are disabled for inactive courses">
                        Reply
                      </Button>
                    )}
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
                    {isAdmin && currentUser.username !== comment.username && (
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
            <CommentItem
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
              formatTermForDisplay={formatTermForDisplay}
              courseStatus={courseStatus}
            />
          ))}
        </Box>
      )}
      
      {level === 0 && <Divider sx={{ my: 2, width: '100%' }} />}
    </Box>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Derive `subject` and `code` from the single route param.
  const [derivedSubject, derivedCode] = (id ?? '').split('-', 2);

  // Early‐out if url is malformed
  const subject = derivedSubject?.trim();
  const code = derivedCode?.trim();

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [replyTermYear, setReplyTermYear] = useState('');
  const [replyTermSeason, setReplyTermSeason] = useState('');
  const [replyGradeReceived, setReplyGradeReceived] = useState('');
  const [uploadNoteDialogOpen, setUploadNoteDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [termTaken, setTermTaken] = useState('');
  const [termYear, setTermYear] = useState('');
  const [termSeason, setTermSeason] = useState('');
  const [gradeReceived, setGradeReceived] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteTermTaken, setNoteTermTaken] = useState('');
  const [noteInstructorTaken, setNoteInstructorTaken] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentStats, setCommentStats] = useState<{ [key: number]: { likes: number; dislikes: number } }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: boolean | null }>({});
  
  // Edit note states
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteLink, setEditNoteLink] = useState('');
  const [editNoteDescription, setEditNoteDescription] = useState('');
  const [editNoteTermTaken, setEditNoteTermTaken] = useState('');
  const [editNoteInstructorTaken, setEditNoteInstructorTaken] = useState('');
  
  // Ban user states
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');
  
  // Edit course states
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseNameEn, setEditCourseNameEn] = useState('');
  const [editCourseNameTr, setEditCourseNameTr] = useState('');
  const [editSuCredit, setEditSuCredit] = useState('');
  const [editEctsCredit, setEditEctsCredit] = useState('');
  const [editEngineeringEcts, setEditEngineeringEcts] = useState('');
  const [editBasicScienceEcts, setEditBasicScienceEcts] = useState('');
  const [editContentEn, setEditContentEn] = useState('');
  const [editContentTr, setEditContentTr] = useState('');
  const [editLinkEn, setEditLinkEn] = useState('');
  const [editLinkTr, setEditLinkTr] = useState('');
  const [editCourseStatus, setEditCourseStatus] = useState(true);
  
  const queryClient = useQueryClient();

  // Helper functions for term formatting
  const formatTermForDB = (year: string, season: string): string => {
    if (!year || !season) return '';
    const seasonCode = season === 'Fall' ? '01' : season === 'Spring' ? '02' : '03';
    return `${year}${seasonCode}`;
  };

  const formatTermForDisplay = (termCode: string): string => {
    if (!termCode || termCode.length !== 6) return termCode;
    const year = termCode.substring(0, 4);
    const seasonCode = termCode.substring(4, 6);
    const season = seasonCode === '01' ? 'Fall' : seasonCode === '02' ? 'Spring' : 'Summer';
    return `${year} ${season}`;
  };

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    enabled: !!subject && !!code,
    queryKey: ['course', subject, code],
    queryFn: () => apiService.courses.getCourseDetails(subject as string, code as string),
  });

  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery<CourseComment[]>({
    queryKey: ['courseComments', subject, code],
    queryFn: async () => {
      console.log(`Fetching comments for course ${course?.courseId}`);
      const result = await apiService.courses.getComments(course?.courseId!);
      console.log(`Fetched ${result?.length || 0} comments:`, result);
      return result;
    },
    enabled: !!course,
    staleTime: 0, // Always refetch when invalidated
    refetchOnWindowFocus: false,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['courseNotes', subject, code],
    queryFn: () => apiService.note.getNotes(course?.courseId!),
    enabled: !!course,
  });

  // Fetch comment stats and user ratings when comments are loaded
  useEffect(() => {
    if (comments && comments.length > 0) {
      const fetchStatsAndRatings = async () => {
        const statsPromises = comments.map(comment => 
          apiService.courses.getCommentStats(comment.commentId)
            .then(stats => ({ commentId: comment.commentId, stats }))
            .catch(() => ({ commentId: comment.commentId, stats: { likes: 0, dislikes: 0 } }))
        );
        
        const userRatingsPromises = comments.map(comment => 
          apiService.courses.getUserRating(comment.commentId)
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
    mutationFn: (commentId: number) => apiService.courses.deleteComment(commentId),
    onSuccess: async () => {
      // Refresh comments and their stats
      await queryClient.invalidateQueries({ queryKey: ['courseComments', subject, code] });
      await queryClient.refetchQueries({ queryKey: ['courseComments', subject, code] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      setCommentError('Failed to delete comment. Please try again.');
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content, anonymous, termTaken, gradeReceived }: { 
      commentId: number; 
      content: string; 
      anonymous: boolean; 
      termTaken?: number | null; 
      gradeReceived?: string | null; 
    }) => 
      apiService.courses.updateComment(commentId, { content, anonymous, termTaken, gradeReceived }),
    onSuccess: async () => {
      // Refresh comments and their stats
      await queryClient.invalidateQueries({ queryKey: ['courseComments', subject, code] });
      await queryClient.refetchQueries({ queryKey: ['courseComments', subject, code] });
    },
    onError: (error) => {
      console.error('Failed to edit comment:', error);
      setCommentError('Failed to edit comment. Please try again.');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (comment: Partial<CourseComment>) => apiService.courses.addComment(course?.courseId!, comment),
    onSuccess: async (newComment) => {
      console.log('Comment added successfully, invalidating cache and refetching...');
      // Force invalidate and refetch the comments
      await queryClient.invalidateQueries({ queryKey: ['courseComments', subject, code] });
      await queryClient.refetchQueries({ queryKey: ['courseComments', subject, code] });
      
      setNewComment('');
      setTermTaken('');
      setTermYear('');
      setTermSeason('');
      setGradeReceived('');
      setIsAnonymous(false);
      setCommentDialogOpen(false);
      setCommentError('');
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
      setCommentError('Failed to add comment. Please try again.');
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: (reply: Partial<CourseComment>) => apiService.courses.addComment(course?.courseId!, reply),
    onSuccess: async (newReply) => {
      console.log('Reply added successfully, invalidating cache and refetching...');
      // Force invalidate and refetch the comments
      await queryClient.invalidateQueries({ queryKey: ['courseComments', subject, code] });
      await queryClient.refetchQueries({ queryKey: ['courseComments', subject, code] });
      
      setReplyContent('');
      setReplyAnonymous(false);
      setReplyTermYear('');
      setReplyTermSeason('');
      setReplyGradeReceived('');
      setReplyDialogOpen(false);
      setReplyToCommentId(null);
      setCommentError('');
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
        return apiService.courses.removeRating(commentId);
      } else {
        // Rate or change rating
        return apiService.courses.rateComment(commentId, isLike);
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
      queryClient.invalidateQueries({ queryKey: ['courseComments', subject, code] });
    },
    onError: (error) => {
      console.error('Failed to rate comment:', error);
      setCommentError('Failed to rate comment. Please try again.');
    },
  });

  const uploadNoteMutation = useMutation({
    mutationFn: async (noteData: { cloudLink: string; termTaken?: number; instructorTaken?: string; description?: string }) => {
      // Removed Google Drive link validation - assume all links are correct
      return apiService.note.addNote(course?.courseId!, noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseNotes', subject, code] });
      setUploadNoteDialogOpen(false);
      setGoogleDriveLink('');
      setNoteDescription('');
      setNoteTermTaken('');
      setNoteInstructorTaken('');
      setUploadError('');
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Failed to upload note. Please try again.');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => apiService.note.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseNotes', subject, code] });
    },
  });

  const editNoteMutation = useMutation({
    mutationFn: ({ noteId, noteData }: { noteId: number; noteData: { cloudLink: string; termTaken?: number; instructorTaken?: string; description?: string } }) => 
      apiService.note.updateNote(noteId, noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseNotes', subject, code] });
      setEditNoteDialogOpen(false);
      setEditingNoteId(null);
      setEditNoteLink('');
      setEditNoteDescription('');
      setEditNoteTermTaken('');
      setEditNoteInstructorTaken('');
    },
    onError: (error: any) => {
      setUploadError(error.response?.data?.message || 'Failed to update note');
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

  const editCourseMutation = useMutation({
    mutationFn: (courseData: Partial<Course>) => 
      apiService.admin.updateCourse(course?.courseId!, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', subject, code] });
      setEditCourseDialogOpen(false);
      // Clear form
      setEditSubject('');
      setEditCourseCode('');
      setEditCourseNameEn('');
      setEditCourseNameTr('');
      setEditSuCredit('');
      setEditEctsCredit('');
      setEditEngineeringEcts('');
      setEditBasicScienceEcts('');
      setEditContentEn('');
      setEditContentTr('');
      setEditLinkEn('');
      setEditLinkTr('');
      setEditCourseStatus(true);
    },
    onError: (error: any) => {
      console.error('Error updating course:', error);
      // Optionally show error message
    },
  });

  // Log course visit when course is loaded
  useEffect(() => {
    if (course?.courseId) {
      apiService.courses.logCourseVisit(course.courseId);
    }
  }, [course?.courseId]);

  if (courseLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container>
        <Alert severity="error">Course not found.</Alert>
      </Container>
    );
  }

  const handleAddComment = () => {
    console.log("Course object:", course);
    console.log("Course ID:", course?.courseId);
    
    if (!course?.courseId) {
      console.error("Cannot add comment: Course ID is missing");
      return;
    }
    
    // Validate year if provided
    if (termYear && (parseInt(termYear) < 2000 || parseInt(termYear) > 2025)) {
      setCommentError('Year must be between 2000 and 2025');
      return;
    }
    
    // Validate that both year and season are provided together
    if ((termYear && !termSeason) || (!termYear && termSeason)) {
      setCommentError('Please select both year and season, or leave both empty');
      return;
    }
    
    const formattedTerm = termYear && termSeason ? formatTermForDB(termYear, termSeason) : null;
    
    addCommentMutation.mutate({
      content: newComment,
      anonymous: isAnonymous,
      termTaken: formattedTerm ? parseInt(formattedTerm) : null,
      gradeReceived: gradeReceived || null,
      parentCommentId: null // For now, we'll add top-level comments only
    });
  };

  const handleReply = () => {
    if (!course?.courseId || !replyToCommentId) {
      console.error("Cannot add reply: Course ID or parent comment ID is missing");
      return;
    }
    
    // Validate year if provided
    if (replyTermYear && (parseInt(replyTermYear) < 2000 || parseInt(replyTermYear) > 2025)) {
      setCommentError('Year must be between 2000 and 2025');
      return;
    }
    
    // Validate that both year and season are provided together
    if ((replyTermYear && !replyTermSeason) || (!replyTermYear && replyTermSeason)) {
      setCommentError('Please select both year and season, or leave both empty');
      return;
    }
    
    const formattedTerm = replyTermYear && replyTermSeason ? formatTermForDB(replyTermYear, replyTermSeason) : null;
    
    addReplyMutation.mutate({
      content: replyContent,
      anonymous: replyAnonymous,
      termTaken: formattedTerm ? parseInt(formattedTerm) : null,
      gradeReceived: replyGradeReceived || null,
      parentCommentId: replyToCommentId
    });
  };

  const openReplyDialog = (commentId: number) => {
    setReplyToCommentId(commentId);
    setReplyDialogOpen(true);
  };

  const handleUploadNote = () => {
    if (!googleDriveLink.trim()) {
      setUploadError('Please provide a file link');
      return;
    }

    const noteData = {
      cloudLink: googleDriveLink.trim(),
      termTaken: noteTermTaken ? parseInt(noteTermTaken) : undefined,
      instructorTaken: noteInstructorTaken.trim() || undefined,
      description: noteDescription.trim() || undefined,
    };

    uploadNoteMutation.mutate(noteData);
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.noteId);
    setEditNoteLink(note.cloudLink || '');
    setEditNoteDescription(note.description || '');
    setEditNoteTermTaken(note.termTaken?.toString() || '');
    setEditNoteInstructorTaken(note.instructorTaken || '');
    setEditNoteDialogOpen(true);
  };

  const handleUpdateNote = () => {
    if (!editNoteLink.trim()) {
      setUploadError('Please provide a file link');
      return;
    }

    if (editingNoteId) {
      const noteData = {
        cloudLink: editNoteLink.trim(),
        termTaken: editNoteTermTaken ? parseInt(editNoteTermTaken) : undefined,
        instructorTaken: editNoteInstructorTaken.trim() || undefined,
        description: editNoteDescription.trim() || undefined,
      };

      editNoteMutation.mutate({ noteId: editingNoteId, noteData });
    }
  };

  const handleBanUser = (comment: CourseComment) => {
    setBanUserId(comment.userId);
    setBanUsername(comment.username || 'Anonymous');
    setBanDialogOpen(true);
  };

  const handleConfirmBan = () => {
    if (banUserId && banReason.trim()) {
      banUserMutation.mutate({ userId: banUserId, reason: banReason.trim() });
    }
  };

  const handleEditCourse = () => {
    if (course) {
      setEditSubject(course.subject || '');
      setEditCourseCode(course.courseCode || '');
      setEditCourseNameEn(course.courseNameEn || '');
      setEditCourseNameTr(course.courseNameTr || '');
      setEditSuCredit(course.suCredit?.toString() || '');
      setEditEctsCredit(course.ectsCredit?.toString() || '');
      setEditEngineeringEcts(course.engineeringEcts?.toString() || '');
      setEditBasicScienceEcts(course.basicScienceEcts?.toString() || '');
      setEditContentEn(course.contentEn || '');
      setEditContentTr(course.contentTr || '');
      setEditLinkEn(course.linkEn || '');
      setEditLinkTr(course.linkTr || '');
      setEditCourseStatus(course.courseStatus);
      setEditCourseDialogOpen(true);
    }
  };

  const handleUpdateCourse = () => {
    const courseData = {
      subject: editSubject.trim(),
      courseCode: editCourseCode.trim(),
      courseNameEn: editCourseNameEn.trim(),
      courseNameTr: editCourseNameTr.trim(),
      suCredit: editSuCredit ? parseInt(editSuCredit) : undefined,
      ectsCredit: editEctsCredit ? parseInt(editEctsCredit) : undefined,
      engineeringEcts: editEngineeringEcts ? parseInt(editEngineeringEcts) : undefined,
      basicScienceEcts: editBasicScienceEcts ? parseInt(editBasicScienceEcts) : undefined,
      contentEn: editContentEn.trim(),
      contentTr: editContentTr.trim(),
      linkEn: editLinkEn.trim(),
      linkTr: editLinkTr.trim(),
      courseStatus: editCourseStatus,
    };

    editCourseMutation.mutate(courseData);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <PictureAsPdf color="error" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <InsertDriveFile color="primary" />;
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return <InsertDriveFile color="warning" />;
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return <InsertDriveFile color="success" />;
    } else {
      return <FilePresent />;
    }
  };

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {course.subject} {course.courseCode}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {course.courseNameEn}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {course.courseNameTr}
                </Typography>
                {!course.courseStatus && (
                  <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2">
                      <strong>This course is inactive/outdated.</strong> This course is no longer offered or has been replaced. 
                      Comments and new notes are disabled for this course.
                    </Typography>
                  </Alert>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {user?.role === 'ADMIN' && (
                  <Button
                    startIcon={<Edit />}
                    variant="contained"
                    onClick={handleEditCourse}
                    sx={{ mb: 1 }}
                  >
                    Edit Course
                  </Button>
                )}
                <Chip
                  icon={<School />}
                  label={`${course.suCredit} SU Credits`}
                />
                <Chip
                  label={`${course.ectsCredit} ECTS`}
                />
                {course.faculty && (
                  <Chip
                    label={course.faculty}
                    color="primary"
                  />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(_, newValue) => setTabValue(newValue)} 
                aria-label="course tabs"
              >
                <Tab label="Course Content" />
                <Tab label="Comments & Reviews" />
                <Tab label="Course Notes" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Course Content
              </Typography>
              <Typography variant="body1" paragraph>
                {course.contentEn || "No English content available."}
              </Typography>
              <Typography variant="body1" paragraph>
                {course.contentTr || "No Turkish content available."}
              </Typography>
              
              {/* Course Links Section */}
              {(course.linkEn || course.linkTr) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Course Links
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {course.linkEn && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '40px' }}>
                          ENG:
                        </Typography>
                        <Button
                          startIcon={<Link />}
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(course.linkEn, '_blank')}
                          sx={{ textTransform: 'none' }}
                        >
                          {course.linkEn.length > 50 ? `${course.linkEn.substring(0, 50)}...` : course.linkEn}
                        </Button>
                      </Box>
                    )}
                    {course.linkTr && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '40px' }}>
                          TR:
                        </Typography>
                        <Button
                          startIcon={<Link />}
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(course.linkTr, '_blank')}
                          sx={{ textTransform: 'none' }}
                        >
                          {course.linkTr.length > 50 ? `${course.linkTr.substring(0, 50)}...` : course.linkTr}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Comments and Reviews
                </Typography>
                {course.courseStatus ? (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCommentDialogOpen(true)}
                  >
                    Add Comment
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    disabled
                    title="Comments are disabled for inactive courses"
                  >
                    Add Comment
                  </Button>
                )}
              </Box>
              
              {!course.courseStatus && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Comments are disabled for this inactive course. You can view existing comments but cannot add new ones.
                </Alert>
              )}
              
              {commentsLoading ? (
                <LinearProgress />
              ) : comments && comments.length > 0 ? (
                <List>
                  {comments.filter(comment => !comment.parentCommentId).map((comment) => (
                    <CommentItem
                      key={comment.commentId}
                      comment={comment}
                      allComments={comments}
                      level={0}
                      onReply={openReplyDialog}
                      onRate={(commentId, isLike) => rateCommentMutation.mutate({ commentId, isLike })}
                      onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
                      onEdit={(commentId, content, anonymous, termTaken, gradeReceived) => {
                        editCommentMutation.mutate({ commentId, content, anonymous, termTaken, gradeReceived });
                      }}
                      onBan={handleBanUser}
                      currentUser={user}
                      commentStats={commentStats}
                      userRatings={userRatings}
                      formatTermForDisplay={formatTermForDisplay}
                      courseStatus={course.courseStatus}
                    />
                  ))}
                </List>
              ) : (
                <Alert severity="info">No comments yet. Be the first to leave a review!</Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Course Notes and Materials
                </Typography>
                {course.courseStatus ? (
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadNoteDialogOpen(true)}
                  >
                    Upload Note
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    disabled
                    title="Note uploads are disabled for inactive courses"
                  >
                    Upload Note
                  </Button>
                )}
              </Box>
              
              {!course.courseStatus && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Note uploads are disabled for this inactive course. You can view existing notes but cannot upload new ones.
                </Alert>
              )}

              {notesLoading ? (
                <LinearProgress />
              ) : notes && notes.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Term Taken</TableCell>
                        <TableCell>Instructor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={note.noteId} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {note.user?.name && note.user?.surname 
                                ? `${note.user.name} ${note.user.surname}` 
                                : note.user?.username || note.username || 'Anonymous'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {note.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {note.termTaken || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {note.instructorTaken || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {`${new Date(note.createdAt).toLocaleDateString()} ${new Date(note.createdAt).toLocaleTimeString().slice(0, -3)}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button 
                                size="small" 
                                startIcon={<Link />}
                                onClick={() => note.cloudLink && window.open(note.cloudLink, '_blank')}
                                variant="contained"
                                color="primary"
                              >
                                Go to Link
                              </Button>
                              {user && user.username === (note.user?.username || note.username) && (
                                <Button 
                                  size="small" 
                                  startIcon={<Edit />}
                                  onClick={() => handleEditNote(note)}
                                  variant="outlined"
                                >
                                  Edit
                                </Button>
                              )}
                              {user && (user.role === 'ADMIN' || user.username === (note.user?.username || note.username)) && (
                                <Button 
                                  size="small" 
                                  color="error" 
                                  startIcon={<Delete />}
                                  onClick={() => deleteNoteMutation.mutate(note.noteId)}
                                  variant="outlined"
                                >
                                  Delete
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No notes uploaded yet. Be the first to share your notes!</Alert>
              )}
            </TabPanel>
          </Grid>
        </Grid>
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Year"
              value={termYear}
              onChange={(e) => setTermYear(e.target.value)}
              placeholder="e.g., 2021"
              type="number"
              inputProps={{ min: 2000, max: 2025 }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Season</InputLabel>
              <Select
                value={termSeason}
                onChange={(e) => setTermSeason(e.target.value)}
                label="Season"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 150,
                      width: 100,
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Fall">Fall</MenuItem>
                <MenuItem value="Spring">Spring</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grade Received</InputLabel>
            <Select
              value={gradeReceived}
              onChange={(e) => setGradeReceived(e.target.value)}
              label="Grade Received"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 80,
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="C+">C+</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="C-">C-</MenuItem>
              <MenuItem value="D+">D+</MenuItem>
              <MenuItem value="D">D</MenuItem>
              <MenuItem value="F">F</MenuItem>
              <MenuItem value="NA">NA</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="W">W</MenuItem>
            </Select>
          </FormControl>
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
            {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadNoteDialogOpen} onClose={() => setUploadNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Course Note</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Share your notes, past exams, or other course materials with other students.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please provide a link to your notes. Make sure the link is publicly accessible.
            </Typography>
            
            <TextField
              fullWidth
              label="File Link"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/... or any other file sharing link"
              sx={{ mt: 2, mb: 2 }}
              helperText="Example: Google Drive, Dropbox, OneDrive, or any other file sharing service"
            />

            <TextField
              fullWidth
              label="Description (optional)"
              value={noteDescription}
              onChange={(e) => setNoteDescription(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              placeholder="Brief description of the notes..."
            />

            <TextField
              fullWidth
              label="Term Taken (optional)"
              value={noteTermTaken}
              onChange={(e) => setNoteTermTaken(e.target.value)}
              placeholder="e.g., 202401"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Instructor (optional)"
              value={noteInstructorTaken}
              onChange={(e) => setNoteInstructorTaken(e.target.value)}
              placeholder="e.g., Dr. John Smith"
              sx={{ mb: 2 }}
            />

            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadNoteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUploadNote}
            variant="contained"
            disabled={!googleDriveLink.trim() || !!uploadError}
            startIcon={<CloudUpload />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your Reply"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Year"
              value={replyTermYear}
              onChange={(e) => setReplyTermYear(e.target.value)}
              placeholder="e.g., 2021"
              type="number"
              inputProps={{ min: 2000, max: 2025 }}
              sx={{ flex: 1 }}
            />
                         <FormControl sx={{ flex: 1 }}>
               <InputLabel>Season</InputLabel>
               <Select
                 value={replyTermSeason}
                 onChange={(e) => setReplyTermSeason(e.target.value)}
                 label="Season"
                 MenuProps={{
                   PaperProps: {
                     style: {
                       maxHeight: 150,
                       width: 100,
                     },
                   },
                 }}
               >
                 <MenuItem value="">
                   <em>None</em>
                 </MenuItem>
                 <MenuItem value="Fall">Fall</MenuItem>
                 <MenuItem value="Spring">Spring</MenuItem>
                 <MenuItem value="Summer">Summer</MenuItem>
               </Select>
             </FormControl>
          </Box>
                     <FormControl fullWidth sx={{ mb: 2 }}>
             <InputLabel>Grade Received</InputLabel>
             <Select
               value={replyGradeReceived}
               onChange={(e) => setReplyGradeReceived(e.target.value)}
               label="Grade Received"
               MenuProps={{
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                     width: 80,
                   },
                 },
               }}
             >
               <MenuItem value="">
                 <em>None</em>
               </MenuItem>
               <MenuItem value="A">A</MenuItem>
               <MenuItem value="A-">A-</MenuItem>
               <MenuItem value="B+">B+</MenuItem>
               <MenuItem value="B">B</MenuItem>
               <MenuItem value="B-">B-</MenuItem>
               <MenuItem value="C+">C+</MenuItem>
               <MenuItem value="C">C</MenuItem>
               <MenuItem value="C-">C-</MenuItem>
               <MenuItem value="D+">D+</MenuItem>
               <MenuItem value="D">D</MenuItem>
               <MenuItem value="F">F</MenuItem>
               <MenuItem value="NA">NA</MenuItem>
               <MenuItem value="S">S</MenuItem>
               <MenuItem value="W">W</MenuItem>
             </Select>
           </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={replyAnonymous}
                onChange={(e) => setReplyAnonymous(e.target.checked)}
              />
            }
            label="Reply anonymously"
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
            onClick={handleReply}
            variant="contained"
            disabled={!replyContent.trim() || addReplyMutation.isPending}
          >
            {addReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={editNoteDialogOpen} onClose={() => setEditNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Course Note</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Update your note details.
            </Typography>
            
            <TextField
              fullWidth
              label="File Link"
              value={editNoteLink}
              onChange={(e) => setEditNoteLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/... or any other file sharing link"
              sx={{ mt: 2, mb: 2 }}
              helperText="Example: Google Drive, Dropbox, OneDrive, or any other file sharing service"
            />

            <TextField
              fullWidth
              label="Description (optional)"
              value={editNoteDescription}
              onChange={(e) => setEditNoteDescription(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              placeholder="Brief description of the notes..."
            />

            <TextField
              fullWidth
              label="Term Taken (optional)"
              value={editNoteTermTaken}
              onChange={(e) => setEditNoteTermTaken(e.target.value)}
              placeholder="e.g., 202401"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Instructor (optional)"
              value={editNoteInstructorTaken}
              onChange={(e) => setEditNoteInstructorTaken(e.target.value)}
              placeholder="e.g., Dr. John Smith"
              sx={{ mb: 2 }}
            />

            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNoteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateNote}
            variant="contained"
            disabled={!editNoteLink.trim() || editNoteMutation.isPending}
            startIcon={<Edit />}
          >
            {editNoteMutation.isPending ? 'Updating...' : 'Update Note'}
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

      {/* Edit Course Dialog */}
      <Dialog open={editCourseDialogOpen} onClose={() => setEditCourseDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
          Edit Course Information
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Subject Code"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="e.g., CS, MATH, PHYS"
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  value={editCourseCode}
                  onChange={(e) => setEditCourseCode(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="e.g., 101, 201, 301"
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Course Name (English)"
                  value={editCourseNameEn}
                  onChange={(e) => setEditCourseNameEn(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Course name in English"
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Course Name (Turkish)"
                  value={editCourseNameTr}
                  onChange={(e) => setEditCourseNameTr(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Ders adı (Türkçe)"
                  required
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  fullWidth
                  label="SU Credit"
                  type="number"
                  value={editSuCredit}
                  onChange={(e) => setEditSuCredit(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="4"
                  required
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  fullWidth
                  label="ECTS Credit"
                  type="number"
                  value={editEctsCredit}
                  onChange={(e) => setEditEctsCredit(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="6"
                  required
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  fullWidth
                  label="Engineering ECTS"
                  type="number"
                  value={editEngineeringEcts}
                  onChange={(e) => setEditEngineeringEcts(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="4"
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  fullWidth
                  label="Basic Science ECTS"
                  type="number"
                  value={editBasicScienceEcts}
                  onChange={(e) => setEditBasicScienceEcts(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="0"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Course Content (English)"
                  value={editContentEn}
                  onChange={(e) => setEditContentEn(e.target.value)}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  placeholder="Detailed course description in English..."
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Course Content (Turkish)"
                  value={editContentTr}
                  onChange={(e) => setEditContentTr(e.target.value)}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  placeholder="Detaylı ders açıklaması (Türkçe)..."
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="ENG: Course Link (English)"
                  value={editLinkEn}
                  onChange={(e) => setEditLinkEn(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/course-link-en"
                  helperText="Optional: Link to course page or syllabus in English"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="TR: Course Link (Turkish)"
                  value={editLinkTr}
                  onChange={(e) => setEditLinkTr(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="https://example.com/course-link-tr"
                  helperText="Optional: Link to course page or syllabus in Turkish"
                />
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Course Status:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color={editCourseStatus ? 'text.secondary' : 'primary'}>
                      Deactive
                    </Typography>
                    <Switch
                      checked={editCourseStatus}
                      onChange={(e) => setEditCourseStatus(e.target.checked)}
                      color="primary"
                    />
                    <Typography variant="body2" color={editCourseStatus ? 'primary' : 'text.secondary'}>
                      Active
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {editCourseStatus ? 'Students can add comments and notes' : 'Comments and notes are disabled'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCourseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateCourse}
            variant="contained"
            disabled={!editSubject.trim() || !editCourseCode.trim() || !editCourseNameEn.trim() || !editCourseNameTr.trim() || editCourseMutation.isPending}
            startIcon={<Edit />}
          >
            {editCourseMutation.isPending ? 'Updating...' : 'Update Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 