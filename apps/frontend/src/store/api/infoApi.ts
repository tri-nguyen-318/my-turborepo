import { apiSlice } from './baseApi';

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
  avatarUrl?: string;
  career?: CareerItem[];
  skills?: string[];
}

const infoApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMyInfo: builder.query<PersonalInfo, void>({
      query: () => '/info',
      providesTags: ['PersonalInfo'],
    }),
    updateMyInfo: builder.mutation<PersonalInfo, Partial<PersonalInfo>>({
      query: body => ({ url: '/info/me', method: 'PATCH', body }),
      invalidatesTags: ['PersonalInfo'],
    }),
  }),
});

export const { useGetMyInfoQuery, useUpdateMyInfoMutation } = infoApi;
