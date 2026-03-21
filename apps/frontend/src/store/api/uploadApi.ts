import { apiSlice } from './baseApi';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

export interface UploadedFile {
  id: number;
  key: string;
  location: string;
  filename: string;
  createdAt: string;
  uploader: { email: string; name: string | null } | null;
  canDelete: boolean;
}

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
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
      invalidatesTags: ['UploadedFiles'],
    }),
    abortUpload: builder.mutation<void, { key: string; uploadId: string }>({
      query: body => ({ url: '/api/upload/abort', method: 'POST', body }),
    }),
    listUploadedFiles: builder.query<UploadedFile[], void>({
      query: () => '/api/upload/files',
      providesTags: ['UploadedFiles'],
    }),
    deleteUploadedFile: builder.mutation<{ ok: boolean }, number>({
      query: id => ({ url: `/api/upload/files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['UploadedFiles'],
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useGetSignedUrlMutation,
  useCompleteUploadMutation,
  useAbortUploadMutation,
  useListUploadedFilesQuery,
  useDeleteUploadedFileMutation,
} = uploadApi;

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
