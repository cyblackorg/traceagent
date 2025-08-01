import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, GlobalStyles } from '@mui/material';
import { LogOut, User, Database, MessageSquare, Users } from 'lucide-react';
import LogTable from './components/LogTable';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, canManageUsers } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'users'>('main');
  const [logsData, setLogsData] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const menuItems = [
    {
      text: 'Log Analysis',
      icon: <Database size={20} />,
      view: 'main' as const,
    },
    // Only show User Management if user has permission to manage users
    ...(canManageUsers() ? [{
      text: 'User Management',
      icon: <Users size={20} />,
      view: 'users' as const,
    }] : []),
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <img 
              src="/favicon.svg" 
              alt="TraceAgent Logo" 
              style={{ width: 24, height: 24 }}
            />
            <Typography variant="h6">
              TraceAgent
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.client_id || 'Admin'}
          </Typography>
        </Box>
        
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => setCurrentView(item.view)}
              sx={{
                cursor: 'pointer',
                bgcolor: currentView === item.view ? 'primary.main' : 'transparent',
                color: currentView === item.view ? 'primary.contrastText' : 'inherit',
                '&:hover': {
                  bgcolor: currentView === item.view ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItem>
            <ListItemIcon>
              <User size={20} />
            </ListItemIcon>
            <ListItemText 
              primary={user?.username}
              secondary={user?.role}
            />
          </ListItem>
          <ListItem onClick={logout} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <img 
                src="/favicon.svg" 
                alt="TraceAgent Logo" 
                style={{ width: 20, height: 20 }}
              />
              <Typography variant="h6">
                {currentView === 'main' ? 'Log Analysis' : 'User Management'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={16} />
                <Typography variant="body2">
                  {user?.username} ({user?.role})
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
          {currentView === 'main' ? (
            <Box sx={{ display: 'flex', height: '100%' }}>
              <LogTable logsData={logsData} />
              <ChatInterface onLogsReceived={setLogsData} />
            </Box>
          ) : (
            <UserManagement />
          )}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@keyframes typing': {
            '0%, 60%, 100%': {
              transform: 'translateY(0)',
              opacity: 0.4,
            },
            '30%': {
              transform: 'translateY(-10px)',
              opacity: 1,
            },
          },
        }}
      />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
