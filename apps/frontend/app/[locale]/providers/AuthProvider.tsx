'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from '@/navigation';

interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification failed', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = React.useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    router.push('/');
  }, [router]);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/signin');
  }, [router]);

  const contextValue = React.useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
