import { fetchJson } from '../fetchJson';

export interface CareerItem {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

export interface PersonalInfo {
  name?: string;
  role?: string;
  bio?: string;
  phone?: string;
  location?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  cvUrl?: string;
  career?: CareerItem[];
}

const getMyInfo = async (token: string): Promise<PersonalInfo | null> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/info/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateMyInfo = async (info: PersonalInfo, token: string): Promise<PersonalInfo> => {
  return fetchJson(`${process.env.NEXT_PUBLIC_API_URL}/info/me`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(info),
  });
};

export const infoApi = {
  getMyInfo,
  updateMyInfo,
};
