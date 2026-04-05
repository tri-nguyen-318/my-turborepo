import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
import type { User } from '@/store/authSlice';

export interface RefreshResponse {
  access_token: string;
}

export const authApiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    refreshToken: builder.mutation<RefreshResponse, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
    }),
    updateProfile: builder.mutation<User, { name?: string; avatarUrl?: string }>({
      query: body => ({ url: '/auth/profile', method: 'POST', body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useRefreshTokenMutation,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApiSlice;
