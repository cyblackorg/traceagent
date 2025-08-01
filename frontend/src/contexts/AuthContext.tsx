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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 