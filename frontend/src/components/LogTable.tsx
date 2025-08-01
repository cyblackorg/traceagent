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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, Download, RefreshCw } from 'lucide-react';
import { FilterList } from '@mui/icons-material';
import apiService, { LogData, Client } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface LogEntry {
  [key: string]: string | number;
}

const getLevelColor = (level: string) => {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return '#f44336';
    case 'WARNING':
      return '#ff9800';
    case 'INFO':
      return '#2196f3';
    case 'DEBUG':
      return '#9e9e9e';
    default:
      return '#757575';
  }
};

const getActionColor = (action: string) => {
  switch (action?.toUpperCase()) {
    case 'ACCEPT':
      return '#4caf50';
    case 'DROP':
      return '#f44336';
    case 'REJECT':
      return '#ff9800';
    default:
      return '#757575';
  }
};

const getSourceColor = (source: string) => {
  switch (source) {
    case 'application':
      return '#4caf50';
    case 'network':
      return '#2196f3';
    case 'syslog':
      return '#ff9800';
    default:
      return '#757575';
  }
};

const LogTable: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('maze_bank');
  const [clients, setClients] = useState<Client[]>([]);
  const [logData, setLogData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);

  // Fetch available clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await apiService.getClients();
        setClients(clientsData);
        
        // Set default client based on user's client_id
        if (user?.client_id) {
          setSelectedClient(user.client_id);
        } else if (clientsData.length > 0) {
          setSelectedClient(clientsData[0].id);
        }
      } catch (error) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [user]);

  // Fetch logs when client or source changes
  useEffect(() => {
    if (selectedClient && selectedSource !== 'all') {
      fetchLogs();
    } else if (selectedSource === 'all') {
      // Show all log types for the selected client
      setFilteredLogs([]);
      setLogData(null);
    }
  }, [selectedClient, selectedSource]);

  const fetchLogs = async () => {
    if (!selectedClient || selectedSource === 'all') return;

    setLoading(true);
    setError(null);

    try {
      // Include authentication token in the request
      const token = user?.session_token;
      const data = await apiService.getLogs(selectedClient, selectedSource, searchTerm, token);
      
      if (data) {
        setLogData(data);
        setFilteredLogs(data.full_data || []);
      } else {
        setError('Failed to fetch logs');
        setFilteredLogs([]);
      }
    } catch (error) {
      setError('Failed to fetch logs');
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (logData) {
      const filtered = logData.full_data.filter(log => {
        const searchableText = JSON.stringify(log).toLowerCase();
        return searchableText.includes(term.toLowerCase());
      });
      setFilteredLogs(filtered);
    }
  };

  const handleSourceChange = (event: any) => {
    const source = event.target.value;
    setSelectedSource(source);
  };

  const handleClientChange = (event: any) => {
    const client = event.target.value;
    setSelectedClient(client);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const renderLogRow = (log: LogEntry, index: number) => {
    const columns = logData?.columns || [];
    
    return (
      <TableRow key={index} hover>
        {columns.map((column, colIndex) => {
          const value = log[column];
          
          // Special rendering for specific columns
          if (column === 'level' || column === 'action') {
            return (
              <TableCell key={colIndex}>
                <Chip
                  label={String(value)}
                  size="small"
                  sx={{
                    bgcolor: column === 'level' ? getLevelColor(String(value)) : getActionColor(String(value)),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </TableCell>
            );
          }
          
          if (column === 'timestamp') {
            return (
              <TableCell key={colIndex} sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {String(value)}
              </TableCell>
            );
          }
          
          return (
            <TableCell key={colIndex} sx={{ maxWidth: 200 }}>
              <Typography variant="body2" noWrap>
                {String(value)}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'app_logs':
        return 'Application';
      case 'network_logs':
        return 'Network';
      case 'syslog':
        return 'Syslog';
      default:
        return source;
    }
  };

  return (
    <Box
      sx={{
        width: '60%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Log Analysis
          </Typography>
          <Tooltip title="Refresh logs">
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
              <RefreshCw />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter logs">
            <IconButton size="small">
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export logs">
            <IconButton size="small">
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClient}
              label="Client"
              onChange={handleClientChange}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={selectedSource}
              label="Source"
              onChange={handleSourceChange}
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="app_logs">Application</MenuItem>
              <MenuItem value="network_logs">Network</MenuItem>
              <MenuItem value="syslog">Syslog</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
          '& .MuiTableRow-root:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : logData && filteredLogs.length > 0 ? (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {logData.columns.map((column, index) => (
                  <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log, index) => renderLogRow(log, index))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="body1" color="text.secondary">
              {selectedSource === 'all' 
                ? 'Select a log source to view data' 
                : 'No logs found for the selected criteria'}
            </Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default LogTable; 