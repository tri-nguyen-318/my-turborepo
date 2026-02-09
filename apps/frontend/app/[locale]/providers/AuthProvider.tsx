'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { authApi } from '@/lib/api/auth/authApi';

interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getAccessToken: () => string | null;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isAuthenticated: false,
  getAccessToken: () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get a new access token using the HttpOnly cookie
        const { access_token } = await authApi.refreshToken();
        
        if (access_token) {
          setAccessToken(access_token);
          
          // Now fetch user profile
          const userData = await authApi.getProfile(access_token);
          if (userData) {
            setUser(userData);
          }
        } else {
          setUser(null);
          setAccessToken(null);
        }
      } catch (error) {
        console.error('Auth verification failed', error);
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = React.useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    router.push('/');
  }, [router]);

  const logout = React.useCallback(async () => {
    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch (e) {
      console.error('Logout failed', e);
    }
    setAccessToken(null);
    setUser(null);
    router.push('/signin');
  }, [router, accessToken]);

  const updateUser = React.useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    accessToken,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    getAccessToken: () => accessToken,
  }), [user, accessToken, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
