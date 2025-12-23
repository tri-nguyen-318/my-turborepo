import { useMutation } from '@tanstack/react-query';
import * as uploadApi from './uploadApi';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

/**
 * Hook to initiate multipart upload
 */
export const useInitiateUpload = () => {
  return useMutation({
    mutationFn: ({ filename, contentType }: { filename: string; contentType: string }) =>
      uploadApi.initiateUploadApi(filename, contentType),
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
    }: {
      key: string;
      uploadId: string;
      partNumber: number;
    }) => uploadApi.getSignedUrlApi(key, uploadId, partNumber),
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
    }) => uploadApi.uploadChunkApi(signedUrl, chunk, contentType),
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
    }: {
      key: string;
      uploadId: string;
      parts: UploadPart[];
    }) => uploadApi.completeUploadApi(key, uploadId, parts),
  });
};

/**
 * Hook to abort multipart upload
 */
export const useAbortUpload = () => {
  return useMutation({
    mutationFn: ({ key, uploadId }: { key: string; uploadId: string }) =>
      uploadApi.abortUploadApi(key, uploadId),
  });
};
