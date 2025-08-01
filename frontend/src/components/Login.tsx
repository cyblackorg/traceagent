import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import { Lock, User, Shield, Bug, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(username, password);
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'Admin', description: 'Full access to all clients' },
    { username: 'maze_bank_user1', password: 'password123', role: 'Maze Bank User', description: 'Access to Maze Bank logs' },
    { username: 'maze_bank_admin', password: 'maze123', role: 'Maze Bank Admin', description: 'Admin access to Maze Bank' },
    { username: 'lifeinvader_user1', password: 'password123', role: 'LifeInvader User', description: 'Access to LifeInvader logs' },
    { username: 'lifeinvader_admin', password: 'life123', role: 'LifeInvader Admin', description: 'Admin access to LifeInvader' },
    { username: 'trevor_user1', password: 'password123', role: 'Trevor Phillips User', description: 'Access to Trevor Phillips logs' },
    { username: 'trevor_admin', password: 'trevor123', role: 'Trevor Phillips Admin', description: 'Admin access to Trevor Phillips' },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        {/* Header */}
        <Box textAlign="center">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
            <img 
              src="/favicon.svg" 
              alt="TraceAgent Logo" 
              style={{ width: 48, height: 48 }}
            />
            <Typography variant="h3" component="h1">
              TraceAgent
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Log Analysis AI Assistant
          </Typography>
        </Box>

        <Box display="flex" gap={3} width="100%">
          {/* Login Form */}
          <Paper elevation={3} sx={{ p: 4, flex: 1 }}>
            <Typography variant="h5" gutterBottom>
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use any of the demo accounts below to test the vulnerable authentication system.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: <User size={20} style={{ marginRight: 8 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: <Lock size={20} style={{ marginRight: 8 }} />,
                }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3 }}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Shield />}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Paper>

          {/* Demo Accounts */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <User size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Demo Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use these accounts to test the system functionality.
              </Typography>
              
              <List dense>
                {demoAccounts.map((account, index) => (
                  <React.Fragment key={account.username}>
                    <ListItem 
                      onClick={() => {
                        setUsername(account.username);
                        setPassword(account.password);
                      }}
                      sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon>
                        <User size={16} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {account.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {account.role} • {account.description}
                            </Typography>
                          </Box>
                        }
                        secondary={`Password: ${account.password}`}
                      />
                    </ListItem>
                    {index < demoAccounts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* System Information */}
        <Paper elevation={1} sx={{ p: 3, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            System Features
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {[
              'Multi-client Support',
              'Real-time Log Analysis',
              'AI Chat Assistant',
              'User Management',
              'Role-based Access',
              'Session Management'
            ].map((feature) => (
              <Chip
                key={feature}
                label={feature}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 