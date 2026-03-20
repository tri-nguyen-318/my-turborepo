import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

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

export interface SendEmailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: ['PersonalInfo'],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: builder => ({
    getMyInfo: builder.query<PersonalInfo, void>({
      query: () => '/info',
      providesTags: ['PersonalInfo'],
    }),
    updateMyInfo: builder.mutation<PersonalInfo, Partial<PersonalInfo>>({
      query: body => ({ url: '/info/me', method: 'PATCH', body }),
      invalidatesTags: ['PersonalInfo'],
    }),
    sendEmail: builder.mutation<SendEmailResponse, SendEmailRequest>({
      query: body => ({ url: '/api/email/send', method: 'POST', body }),
    }),
    initiateUpload: builder.mutation<
      { uploadId: string; key: string },
      { filename: string; contentType: string }
    >({
      query: body => ({ url: '/api/upload/initiate', method: 'POST', body }),
    }),
    getSignedUrl: builder.mutation<
      { signedUrl: string },
      { key: string; uploadId: string; partNumber: number }
    >({
      query: body => ({ url: '/api/upload/url', method: 'POST', body }),
    }),
    completeUpload: builder.mutation<
      { location: string; bucket: string; key: string },
      { key: string; uploadId: string; parts: UploadPart[] }
    >({
      query: body => ({ url: '/api/upload/complete', method: 'POST', body }),
    }),
    abortUpload: builder.mutation<void, { key: string; uploadId: string }>({
      query: body => ({ url: '/api/upload/abort', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetMyInfoQuery,
  useUpdateMyInfoMutation,
  useSendEmailMutation,
  useInitiateUploadMutation,
  useGetSignedUrlMutation,
  useCompleteUploadMutation,
  useAbortUploadMutation,
} = apiSlice;

// Direct S3 PUT — not routed through our API, so kept as a plain function
export const uploadChunk = async (signedUrl: string, chunk: Blob): Promise<string> => {
  const response = await fetch(signedUrl, { method: 'PUT', body: chunk });
  const eTag = response.headers.get('ETag');
  if (!response.ok || !eTag) {
    if (response.status === 507)
      throw new Error('Storage full! MinIO has insufficient storage space.');
    throw new Error(`Chunk upload failed: ${await response.text()}`);
  }
  return eTag.replace(/"/g, '');
};
