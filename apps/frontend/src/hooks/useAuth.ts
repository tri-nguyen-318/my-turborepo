'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from '@/navigation';
import { setCredentials, clearCredentials, updateUser } from '@/store/authSlice';
import type { RootState } from '@/store/store';
import type { User } from '@/store/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

export type { User };

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, accessToken, loading } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const login = useCallback(
    (token: string, userData: User) => {
      dispatch(setCredentials({ user: userData, accessToken: token }));
      router.push('/');
    },
    [dispatch, router],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // proceed regardless
    }
    dispatch(clearCredentials());
    router.push('/signin');
  }, [dispatch, logoutMutation, router]);

  const handleUpdateUser = useCallback(
    (updates: Partial<User>) => {
      dispatch(updateUser(updates));
    },
    [dispatch],
  );

  return {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser: handleUpdateUser,
    getAccessToken: () => accessToken,
  };
};
