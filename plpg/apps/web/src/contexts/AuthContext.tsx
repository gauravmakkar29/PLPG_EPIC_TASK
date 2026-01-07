import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User, type LoginCredentials, type SignupCredentials } from '../lib/auth';
import { useQuery } from '@tanstack/react-query';
import type { Session } from '@plpg/shared';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = authService.isAuthenticated();
  
  // Fetch session if authenticated
  const { data: session, isLoading: isLoadingSession } = useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await api.get<Session>('/auth/me');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: false,
  });

  // Update user when session loads
  useEffect(() => {
    if (session) {
      setUser({
        id: session.userId,
        email: session.email,
        name: session.name,
      });
    } else if (!isLoadingSession && !isAuthenticated) {
      setUser(null);
    }
  }, [session, isLoadingSession, isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    const response = await authService.signup(credentials);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    session: session || null,
    isLoading: isLoadingSession,
    isAuthenticated: !!user && isAuthenticated,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

