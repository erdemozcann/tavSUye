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
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';
import type { User } from '../../types';

export default function UserManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [banConfirmOpen, setBanConfirmOpen] = useState(false);
  const [unbanConfirmOpen, setUnbanConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Mock data for now - in a real implementation, this would come from an API endpoint
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => {
      // This is a placeholder. In a real implementation, you would fetch from your API
      return Promise.resolve([
        {
          userId: 1,
          username: 'john.doe',
          email: 'john.doe@sabanciuniv.edu',
          name: 'John',
          surname: 'Doe',
          fullName: 'John Doe',
          role: 'STUDENT',
          accountStatus: 'ACTIVE',
          is2FAEnabled: false,
          emailVerified: true,
          isBanned: false,
        },
        {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@sabanciuniv.edu',
          name: 'Jane',
          surname: 'Smith',
          fullName: 'Jane Smith',
          role: 'STUDENT',
          accountStatus: 'BANNED',
          is2FAEnabled: true,
          emailVerified: true,
          isBanned: true,
        },
        {
          userId: 3,
          username: 'admin.user',
          email: 'admin@sabanciuniv.edu',
          name: 'Admin',
          surname: 'User',
          fullName: 'Admin User',
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
          is2FAEnabled: true,
          emailVerified: true,
          isBanned: false,
        },
      ]);
    },
  });

  const banUserMutation = useMutation({
    mutationFn: (userId: number) => adminApi.banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setBanConfirmOpen(false);
      setSelectedUser(null);
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId: number) => adminApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUnbanConfirmOpen(false);
      setSelectedUser(null);
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setBanConfirmOpen(true);
  };

  const handleUnbanUser = (user: User) => {
    setSelectedUser(user);
    setUnbanConfirmOpen(true);
  };

  const confirmBanUser = () => {
    if (selectedUser) {
      banUserMutation.mutate(selectedUser.userId);
    }
  };

  const confirmUnbanUser = () => {
    if (selectedUser) {
      unbanUserMutation.mutate(selectedUser.userId);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    `${user.name} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by username, email, or name"
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
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell>{user.userId}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.fullName || `${user.name} ${user.surname}`}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role} 
                                color={user.role === 'ADMIN' ? 'secondary' : 'default'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={user.isBanned ? 'Banned' : 'Active'} 
                                color={user.isBanned ? 'error' : 'success'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              {user.role !== 'ADMIN' && (
                                user.isBanned ? (
                                  <Button
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleUnbanUser(user)}
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    startIcon={<BlockIcon />}
                                    onClick={() => handleBanUser(user)}
                                  >
                                    Ban
                                  </Button>
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Ban User Confirmation Dialog */}
      <Dialog
        open={banConfirmOpen}
        onClose={() => setBanConfirmOpen(false)}
      >
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to ban {selectedUser?.fullName || `${selectedUser?.name} ${selectedUser?.surname}`} ({selectedUser?.username})? 
            This will prevent them from logging in and participating in the platform.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmBanUser} 
            color="error" 
            variant="contained"
            disabled={banUserMutation.isPending}
          >
            {banUserMutation.isPending ? <CircularProgress size={24} /> : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unban User Confirmation Dialog */}
      <Dialog
        open={unbanConfirmOpen}
        onClose={() => setUnbanConfirmOpen(false)}
      >
        <DialogTitle>Unban User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unban {selectedUser?.fullName || `${selectedUser?.name} ${selectedUser?.surname}`} ({selectedUser?.username})? 
            This will restore their access to the platform.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnbanConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmUnbanUser} 
            color="success" 
            variant="contained"
            disabled={unbanUserMutation.isPending}
          >
            {unbanUserMutation.isPending ? <CircularProgress size={24} /> : 'Unban User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 