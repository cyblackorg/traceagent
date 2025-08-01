// API service for communicating with the TraceAgent backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export interface LogEntry {
  [key: string]: string | number;
}

export interface LogData {
  client: string;
  log_type: string;
  total_entries: number;
  columns: string[];
  sample_data: LogEntry[];
  full_data: LogEntry[];
  url: string;
}

export interface ChatMessage {
  message: string;
  client_id?: string;
  session_token?: string;
}

export interface ChatResponse {
  response: string;
  client_id: string;
  timestamp: string;
  session_token: string;
  // New fields for enhanced responses
  message?: string; // For new response format
  logs?: { [logType: string]: LogData };
  insights?: SecurityInsights;
  correlations?: SecurityCorrelations;
  security_alert?: string;
  suspicious_activity?: string;
  sql_query?: string;
  execution_result?: any;
  error?: string;
  details?: string;
  provider?: string;
  model?: string;
  processed?: boolean;
}

export interface SecurityInsights {
  total_events: number;
  security_events: number;
  failed_logins: number;
  sql_injections: number;
  blocked_connections: number;
  system_warnings: number;
  suspicious_ips: string[];
  affected_users: string[];
  critical_endpoints: string[];
}

export interface SecurityCorrelations {
  cross_log_ips?: { [ip: string]: { log_types: string[]; event_count: number } };
  user_activity?: { [user: string]: { log_types: string[]; event_count: number } };
}

export interface Client {
  id: string;
  name: string;
  folder: string;
  logs: {
    app_logs: string;
    network_logs: string;
    syslog: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: string;
  client_id: string | null;
  permissions: string[];
  session_token: string;
  jwt_token: string;
  created_at: string;
}

export interface UserInfo {
  username: string;
  role: string;
  client_id: string | null;
  permissions: string[];
  created_at: string;
}

export interface TokenVerification {
  valid: boolean;
  user?: UserInfo;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get available clients
  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config`);
      const config = await response.json();
      
      return Object.entries(config.clients || {}).map(([id, client]: [string, any]) => ({
        id,
        name: client.name,
        folder: client.folder,
        logs: client.logs
      }));
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      return [];
    }
  }

  // Get logs for a specific client and log type
  async getLogs(clientId: string, logType: string, searchQuery?: string, token?: string): Promise<LogData | null> {
    try {
      let url = `${this.baseUrl}/api/logs/${clientId}/${logType}`;
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (token) {
        params.append('token', token);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Log fetch error:', data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return null;
    }
  }

  // Send chat message to AI
  async sendChatMessage(message: string, clientId: string = 'maze_bank', sessionToken?: string): Promise<ChatResponse | null> {
    try {
      const payload: ChatMessage = {
        message,
        client_id: clientId,
        session_token: sessionToken
      };

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return null;
    }
  }

  // Get all logs for admin view
  async getAllLogs(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/all-logs?bypass=true`, {
        headers: {
          'Admin-Token': 'admin-token-123'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch all logs:', error);
      return null;
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<LoginResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }

  async verifyToken(token: string): Promise<TokenVerification | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async getUsers(): Promise<UserInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async getUserDetails(username: string): Promise<UserInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 