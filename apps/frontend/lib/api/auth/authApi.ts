import { fetchJson } from '../fetchJson';

export interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface RefreshResponse {
  access_token: string;
}

const refreshToken = async (): Promise<RefreshResponse> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
};

const getProfile = async (token: string): Promise<User> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateProfile = async (data: { name?: string; avatarUrl?: string }, token: string): Promise<User> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
};

const logout = async (token: string): Promise<void> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
};

export const authApi = {
  refreshToken,
  getProfile,
  updateProfile,
  logout,
};
