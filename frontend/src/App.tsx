import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LogTable from './components/LogTable';
import ChatInterface from './components/ChatInterface';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <LogTable />
        <ChatInterface />
      </Box>
    </ThemeProvider>
  );
}

export default App;
