import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginResponse, UserInfo, apiService } from '../services/api';

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  // Role-based access control
  isSuperAdmin: () => boolean;
  isClientAdmin: () => boolean;
  canSwitchClient: () => boolean;
  canManageUsers: (targetClientId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedToken = localStorage.getItem('traceagent_token');
        if (storedToken) {
          const verification = await apiService.verifyToken(storedToken);
          if (verification?.valid && verification.user) {
            // Reconstruct user object from stored data
            const storedUser = localStorage.getItem('traceagent_user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          } else {
            // Clear invalid session
            localStorage.removeItem('traceagent_token');
            localStorage.removeItem('traceagent_user');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('traceagent_token');
        localStorage.removeItem('traceagent_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const loginResponse = await apiService.login(username, password);
      
      if (loginResponse) {
        setUser(loginResponse);
        
        // Store session data
        localStorage.setItem('traceagent_token', loginResponse.session_token);
        localStorage.setItem('traceagent_user', JSON.stringify(loginResponse));
        
        return true;
      } else {
        setError('Invalid credentials');
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traceagent_token');
    localStorage.removeItem('traceagent_user');
  };

  const clearError = () => {
    setError(null);
  };

  // Role-based access control functions
  const isSuperAdmin = () => {
    return user?.role === 'super_admin' || user?.role === 'vendor';
  };

  const isClientAdmin = () => {
    return user?.role === 'client_admin' || user?.role === 'admin';
  };

  const canSwitchClient = () => {
    // Only super admin (vendor) can switch client context
    return isSuperAdmin();
  };

  const canManageUsers = (targetClientId?: string) => {
    if (!user) return false;
    
    // Super admin can manage users for all clients
    if (isSuperAdmin()) return true;
    
    // Client admin can only manage users within their own client context
    if (isClientAdmin()) {
      return targetClientId ? targetClientId === user.client_id : true;
    }
    
    return false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    clearError,
    isSuperAdmin,
    isClientAdmin,
    canSwitchClient,
    canManageUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 