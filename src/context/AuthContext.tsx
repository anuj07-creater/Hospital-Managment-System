import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, RegisterPatientData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPatientData) => Promise<User>;
  demoLogin: (role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('rhms_token');

      if (savedToken) {
        try {
          setToken(savedToken);
          // Verify token and fetch real authenticated user from backend API
          const currentUser = await authService.getMe();
          setUser(currentUser);
          localStorage.setItem('rhms_user', JSON.stringify(currentUser));
        } catch (error) {
          console.warn('Session verification failed, clearing credentials:', error);
          localStorage.removeItem('rhms_token');
          localStorage.removeItem('rhms_user');
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // No saved session - user is unauthenticated
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('rhms_token', res.token);
      localStorage.setItem('rhms_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterPatientData): Promise<User> => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('rhms_token', res.token);
      localStorage.setItem('rhms_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (targetRole: UserRole): Promise<User> => {
    setLoading(true);
    try {
      const res = await authService.quickDemoLogin(targetRole);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('rhms_token', res.token);
      localStorage.setItem('rhms_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('rhms_token');
      localStorage.removeItem('rhms_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        loading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
