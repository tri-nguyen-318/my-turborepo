import { useMutation } from '@tanstack/react-query';
import { uploadApi } from './uploadApi';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

/**
 * Hook to initiate multipart upload
 */
export const useInitiateUpload = () => {
  return useMutation({
    mutationFn: ({
      filename,
      contentType,
      token,
    }: {
      filename: string;
      contentType: string;
      token: string;
    }) => uploadApi.initiate(filename, contentType, token),
  });
};

/**
 * Hook to get signed URL for a part
 */
export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: ({
      key,
      uploadId,
      partNumber,
      token,
    }: {
      key: string;
      uploadId: string;
      partNumber: number;
      token: string;
    }) => uploadApi.getSignedUrl(key, uploadId, partNumber, token),
  });
};

/**
 * Hook to upload chunk to S3/MinIO
 */
export const useUploadChunk = () => {
  return useMutation({
    mutationFn: ({
      signedUrl,
      chunk,
      contentType,
    }: {
      signedUrl: string;
      chunk: Blob;
      contentType: string;
    }) => uploadApi.uploadChunk(signedUrl, chunk, contentType),
  });
};

/**
 * Hook to complete multipart upload
 */
export const useCompleteUpload = () => {
  return useMutation({
    mutationFn: ({
      key,
      uploadId,
      parts,
      token,
    }: {
      key: string;
      uploadId: string;
      parts: UploadPart[];
      token: string;
    }) => uploadApi.complete(key, uploadId, parts, token),
  });
};

/**
 * Hook to abort multipart upload
 */
export const useAbortUpload = () => {
  return useMutation({
    mutationFn: ({ key, uploadId, token }: { key: string; uploadId: string; token: string }) =>
      uploadApi.abort(key, uploadId, token),
  });
};
