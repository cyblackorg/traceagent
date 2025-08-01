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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search, Download } from 'lucide-react';
import { FilterList } from '@mui/icons-material';

interface AppLog {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  user: string;
  endpoint: string;
  message: string;
}

interface NetworkLog {
  timestamp: string;
  src_ip: string;
  dest_ip: string;
  protocol: string;
  src_port: number;
  dest_port: number;
  action: 'ACCEPT' | 'DROP' | 'REJECT';
  bytes_sent: number;
  bytes_received: number;
  file_hash: string;
}

interface Syslog {
  timestamp: string;
  host: string;
  process: string;
  pid: number;
  message: string;
}

type LogEntry = (AppLog | NetworkLog | Syslog) & { source: string };

const mockAppLogs: AppLog[] = [
  {
    timestamp: '2025-07-29 07:01:02',
    level: 'ERROR',
    user: 'elliottandrew',
    endpoint: '/api/delete',
    message: 'Session started with session_id=5bf5c5f7-3da1-430e-8890-3bdd646ea569'
  },
  {
    timestamp: '2025-07-26 17:16:02',
    level: 'INFO',
    user: 'nicolas93',
    endpoint: '/api/delete',
    message: 'Failed transaction from IP=89.110.227.70'
  },
  {
    timestamp: '2025-07-25 09:38:02',
    level: 'INFO',
    user: 'christine78',
    endpoint: '/api/login',
    message: 'Exported user data containing email=muellerstephen@nguyen-brown.com'
  },
  {
    timestamp: '2025-07-30 08:28:02',
    level: 'INFO',
    user: 'rsweeney',
    endpoint: '/api/update',
    message: 'Login attempt with username=mendozalori&password=$nFN0)HgBZ'
  },
  {
    timestamp: '2025-07-27 14:17:02',
    level: 'INFO',
    user: 'ethansmith',
    endpoint: '/api/export',
    message: 'User attempted SQL injection payload: \' OR \'1\'=\'1'
  },
  {
    timestamp: '2025-07-26 23:22:02',
    level: 'INFO',
    user: 'sara93',
    endpoint: '/api/update',
    message: 'Exported user data containing email=xreed@clay-clark.com'
  },
  {
    timestamp: '2025-07-30 14:02:02',
    level: 'ERROR',
    user: 'elizabethgreen',
    endpoint: '/api/export',
    message: 'Exported user data containing email=sherry00@johnson-miller.com'
  },
  {
    timestamp: '2025-07-26 20:22:02',
    level: 'ERROR',
    user: 'howellmichael',
    endpoint: '/api/login',
    message: 'Login attempt with username=kimberlyanderson&password=EGN+Yi9k(2'
  },
  {
    timestamp: '2025-07-30 06:45:02',
    level: 'DEBUG',
    user: 'abbottchelsey',
    endpoint: '/api/export',
    message: 'Exported user data containing email=mperez@gmail.com'
  },
  {
    timestamp: '2025-07-25 16:19:02',
    level: 'WARNING',
    user: 'mccanntimothy',
    endpoint: '/api/login',
    message: 'Session started with session_id=2839b74d-9f69-4f9e-a1cd-e80b4e65c817'
  }
];

const mockNetworkLogs: NetworkLog[] = [
  {
    timestamp: '2025-07-29 10:39:02',
    src_ip: '144.47.36.82',
    dest_ip: '166.195.79.94',
    protocol: 'TCP',
    src_port: 63788,
    dest_port: 8080,
    action: 'ACCEPT',
    bytes_sent: 4135,
    bytes_received: 3427,
    file_hash: '26a84f728f059fc7f734fb59383d43128a5d213079779e256826dadcee82913e'
  },
  {
    timestamp: '2025-07-29 06:56:02',
    src_ip: '116.99.10.93',
    dest_ip: '11.227.87.118',
    protocol: 'TCP',
    src_port: 12540,
    dest_port: 3306,
    action: 'DROP',
    bytes_sent: 2285,
    bytes_received: 494,
    file_hash: '593ec6ce763b65defc778567a4d2423d6868fbec30d284a80c08a5dd1523ac27'
  },
  {
    timestamp: '2025-07-28 17:23:02',
    src_ip: '85.187.215.121',
    dest_ip: '222.47.222.10',
    protocol: 'ICMP',
    src_port: 45054,
    dest_port: 3306,
    action: 'REJECT',
    bytes_sent: 2463,
    bytes_received: 4104,
    file_hash: 'edafaf324b2ba060e6d3ebdeedb4b550cc5d910ab2f3941fc13dec6c36b52ba5'
  },
  {
    timestamp: '2025-07-28 04:35:02',
    src_ip: '119.228.69.209',
    dest_ip: '91.16.215.93',
    protocol: 'ICMP',
    src_port: 64427,
    dest_port: 8080,
    action: 'REJECT',
    bytes_sent: 3813,
    bytes_received: 3237,
    file_hash: '89aa51a31b36759e174a8e531c94846d23e1370bababcffedc6e2d7b2afeb4af'
  },
  {
    timestamp: '2025-07-25 11:54:02',
    src_ip: '169.147.72.180',
    dest_ip: '48.116.139.56',
    protocol: 'UDP',
    src_port: 14976,
    dest_port: 80,
    action: 'REJECT',
    bytes_sent: 4121,
    bytes_received: 1917,
    file_hash: '3edfa46d2df3ac0981b6a1994820869eb8d179d64ac8e2d8e31a7e177e6eae2b'
  }
];

const mockSyslogs: Syslog[] = [
  {
    timestamp: 'Jul 29 03:51:02',
    host: 'db-08.levine.net',
    process: 'nginx',
    pid: 9276,
    message: 'Started Session'
  },
  {
    timestamp: 'Jul 30 10:13:02',
    host: 'laptop-88.hayes-garcia.com',
    process: 'sshd',
    pid: 9571,
    message: 'Failed login attempt for user websterjason'
  },
  {
    timestamp: 'Jul 25 13:18:02',
    host: 'web-09.gardner.com',
    process: 'systemd',
    pid: 738,
    message: 'Warning: disk space critically low on /difficult/medical.gif'
  },
  {
    timestamp: 'Jul 28 10:27:02',
    host: 'email-15.ramirez.biz',
    process: 'sudo',
    pid: 2124,
    message: 'Executed process: /class/expect/sign.bmp'
  },
  {
    timestamp: 'Jul 28 05:27:02',
    host: 'email-14.taylor.com',
    process: 'systemd',
    pid: 7799,
    message: 'System rebooted'
  },
  {
    timestamp: 'Jul 29 01:48:02',
    host: 'desktop-78.wallace.info',
    process: 'systemd',
    pid: 3596,
    message: 'Executed process: /school/near/develop.wav'
  },
  {
    timestamp: 'Jul 29 13:22:02',
    host: 'srv-12.jensen.com',
    process: 'cron',
    pid: 6980,
    message: 'System rebooted'
  },
  {
    timestamp: 'Jul 26 04:19:02',
    host: 'lt-20.garrison-campbell.com',
    process: 'nginx',
    pid: 8689,
    message: 'Warning: disk space critically low on /include/receive.html'
  },
  {
    timestamp: 'Jul 28 06:48:02',
    host: 'web-06.sullivan.com',
    process: 'systemd',
    pid: 1560,
    message: 'Started Session'
  },
  {
    timestamp: 'Jul 28 15:11:02',
    host: 'web-33.lee.com',
    process: 'cron',
    pid: 394,
    message: 'Warning: disk space critically low on /bar/answer.html'
  }
];

const getLevelColor = (level: string) => {
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

const getActionColor = (action: string) => {
  switch (action) {
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

const LogTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);

  // Combine all logs with source identification
  const allLogs = [
    ...mockAppLogs.map(log => ({ ...log, source: 'application' as const })),
    ...mockNetworkLogs.map(log => ({ ...log, source: 'network' as const })),
    ...mockSyslogs.map(log => ({ ...log, source: 'syslog' as const }))
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterLogs(term, selectedSource);
  };

  const handleSourceChange = (event: any) => {
    const source = event.target.value;
    setSelectedSource(source);
    filterLogs(searchTerm, source);
  };

  const filterLogs = (term: string, source: string) => {
    let filtered = allLogs;
    
    if (source !== 'all') {
      filtered = filtered.filter(log => log.source === source);
    }
    
    if (term) {
      filtered = filtered.filter(log => {
        const searchableText = JSON.stringify(log).toLowerCase();
        return searchableText.includes(term.toLowerCase());
      });
    }
    
    setFilteredLogs(filtered);
  };

  // Initialize with all logs
  React.useEffect(() => {
    setFilteredLogs(allLogs);
  }, []);

  const renderLogRow = (log: LogEntry & { source: string }, index: number) => {
    if (log.source === 'application') {
      const appLog = log as AppLog & { source: string };
      return (
        <TableRow key={`app-${index}`} hover>
          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {appLog.timestamp}
          </TableCell>
          <TableCell>
            <Chip
              label={appLog.level}
              size="small"
              sx={{
                bgcolor: getLevelColor(appLog.level),
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </TableCell>
          <TableCell>
            <Chip
              label="Application"
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
              }}
            />
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {appLog.user}
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {appLog.endpoint}
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 300 }}>
            <Typography variant="body2" noWrap>
              {appLog.message}
            </Typography>
          </TableCell>
        </TableRow>
      );
    } else if (log.source === 'network') {
      const netLog = log as NetworkLog & { source: string };
      return (
        <TableRow key={`net-${index}`} hover>
          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {netLog.timestamp}
          </TableCell>
          <TableCell>
            <Chip
              label={netLog.action}
              size="small"
              sx={{
                bgcolor: getActionColor(netLog.action),
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </TableCell>
          <TableCell>
            <Chip
              label="Network"
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#2196f3',
                color: '#2196f3',
              }}
            />
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {netLog.src_ip}:{netLog.src_port}
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {netLog.dest_ip}:{netLog.dest_port}
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 300 }}>
            <Typography variant="body2" noWrap>
              {netLog.protocol} - {netLog.bytes_sent}/{netLog.bytes_received} bytes
            </Typography>
          </TableCell>
        </TableRow>
      );
    } else {
      const sysLog = log as Syslog & { source: string };
      return (
        <TableRow key={`sys-${index}`} hover>
          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {sysLog.timestamp}
          </TableCell>
          <TableCell>
            <Chip
              label="INFO"
              size="small"
              sx={{
                bgcolor: '#2196f3',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </TableCell>
          <TableCell>
            <Chip
              label="Syslog"
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#ff9800',
                color: '#ff9800',
              }}
            />
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {sysLog.host}
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 150 }}>
            <Typography variant="body2" noWrap>
              {sysLog.process}[{sysLog.pid}]
            </Typography>
          </TableCell>
          <TableCell sx={{ maxWidth: 300 }}>
            <Typography variant="body2" noWrap>
              {sysLog.message}
            </Typography>
          </TableCell>
        </TableRow>
      );
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={selectedSource}
              label="Source"
              onChange={handleSourceChange}
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="application">Application</MenuItem>
              <MenuItem value="network">Network</MenuItem>
              <MenuItem value="syslog">Syslog</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Level/Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User/IP/Host</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Endpoint/Port/Process</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Message/Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log, index) => renderLogRow(log, index))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogTable; 