import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Eye, User, Shield, Bug, AlertTriangle } from 'lucide-react';
import apiService, { UserInfo } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const { user, canManageUsers, isSuperAdmin, isClientAdmin } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const usersData = await apiService.getUsers();
      
      // Filter users based on permissions
      let filteredUsers = usersData;
      
      if (!isSuperAdmin()) {
        // Client admin can only see users from their own client
        if (isClientAdmin() && user?.client_id) {
          filteredUsers = usersData.filter(u => u.client_id === user.client_id);
        } else {
          // Regular users cannot see any users
          filteredUsers = [];
        }
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (username: string) => {
    try {
      const userDetails = await apiService.getUserDetails(username);
      if (userDetails) {
        // Check if user can manage this specific user
        if (canManageUsers(userDetails.client_id || undefined)) {
          setSelectedUser(userDetails);
          setDialogOpen(true);
        } else {
          setError('You do not have permission to view this user');
        }
      }
    } catch (error) {
      setError('Failed to fetch user details');
      console.error('Error fetching user details:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'client_admin':
        return '#ff9800';
      case 'user':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getFeatureChips = () => {
    return [
      { label: 'User Listing', color: 'primary' },
      { label: 'Role Management', color: 'primary' },
      { label: 'Account Details', color: 'primary' },
      { label: 'Access Control', color: 'primary' },
    ];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img 
            src="/favicon.svg" 
            alt="TraceAgent Logo" 
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="h4">
            User Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage system users and view account information.
        </Typography>
        {!isSuperAdmin() && isClientAdmin() && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You can only view and manage users within your client context.
          </Alert>
        )}
        {!isSuperAdmin() && !isClientAdmin() && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You do not have permission to view or manage users.
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.username} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={16} />
                          <Typography variant="body2" fontWeight="bold">
                            {user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            bgcolor: getRoleColor(user.role),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.client_id || 'Admin'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View User Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user.username)}
                            color="primary"
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {!isSuperAdmin() && !isClientAdmin() 
                          ? 'You do not have permission to view users'
                          : 'No users found for your access level'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={20} />
            User Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">{selectedUser.username}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(selectedUser.role),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client ID
                  </Typography>
                  <Typography variant="body1">{selectedUser.client_id || 'Admin'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Permissions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedUser.permissions.map((permission) => (
                      <Chip
                        key={permission}
                        label={permission}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 