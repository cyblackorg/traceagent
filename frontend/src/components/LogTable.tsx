import React, { useState } from 'react';
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
} from '@mui/material';
import { Search, Download } from 'lucide-react';
import { FilterList } from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  source: 'application' | 'network' | 'syslog';
  message: string;
  details?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15 10:30:15',
    level: 'INFO',
    source: 'application',
    message: 'User authentication successful',
    details: 'User ID: 12345, IP: 192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2024-01-15 10:30:20',
    level: 'WARNING',
    source: 'network',
    message: 'High latency detected',
    details: 'Response time: 2.5s, Threshold: 1s'
  },
  {
    id: '3',
    timestamp: '2024-01-15 10:30:25',
    level: 'ERROR',
    source: 'syslog',
    message: 'Database connection failed',
    details: 'Connection timeout after 30s'
  },
  {
    id: '4',
    timestamp: '2024-01-15 10:30:30',
    level: 'DEBUG',
    source: 'application',
    message: 'Processing request',
    details: 'Request ID: req_12345, Method: GET'
  },
  {
    id: '5',
    timestamp: '2024-01-15 10:30:35',
    level: 'INFO',
    source: 'network',
    message: 'API endpoint called',
    details: 'Endpoint: /api/users, Status: 200'
  }
];

const getLevelColor = (level: LogEntry['level']) => {
  switch (level) {
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

const getSourceColor = (source: LogEntry['source']) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    const filtered = mockLogs.filter(log =>
      log.message.toLowerCase().includes(term.toLowerCase()) ||
      log.details?.toLowerCase().includes(term.toLowerCase()) ||
      log.level.toLowerCase().includes(term.toLowerCase()) ||
      log.source.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLogs(filtered);
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
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
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
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.level}
                    size="small"
                    sx={{
                      bgcolor: getLevelColor(log.level),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.source}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: getSourceColor(log.source),
                      color: getSourceColor(log.source),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" noWrap>
                    {log.message}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {log.details}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogTable; 