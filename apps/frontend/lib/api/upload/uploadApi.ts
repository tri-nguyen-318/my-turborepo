import { SERVER_URL } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';
import { fetchJson } from '../fetchJson';

/**
 * API call to initiate multipart upload
 */
const initiate = async (
  filename: string,
  contentType: string,
): Promise<{ uploadId: string; key: string }> => {
  return fetchJson(`${SERVER_URL}/api/upload/initiate`, {
    method: 'POST',
    body: JSON.stringify({ filename, contentType }),
  });
};

/**
 * API call to get signed upload URL for a part
 */
const getSignedUrl = async (
  key: string,
  uploadId: string,
  partNumber: number,
): Promise<{ signedUrl: string }> => {
  return fetchJson(`${SERVER_URL}/api/upload/url`, {
    method: 'POST',
    body: JSON.stringify({ key, uploadId, partNumber }),
  });
};

/**
 * API call to upload chunk to S3/MinIO
 */
const uploadChunk = async (
  signedUrl: string,
  chunk: Blob,
  contentType: string,
): Promise<string> => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: chunk,
    headers: { 'Content-Type': contentType || 'application/octet-stream' },
  });

  const eTag = response.headers.get('ETag');

  if (!response.ok || !eTag) {
    if (response.status === 507) {
      throw new Error(
        'Storage full! MinIO has insufficient storage space. Please free up disk space.',
      );
    }
    const errorText = await response.text();
    throw new Error(`Chunk upload failed with status ${response.status}: ${errorText}`);
  }

  return eTag.replace(/"/g, ''); // Remove quotes from ETag
};

/**
 * API call to complete multipart upload
 */
const complete = async (
  key: string,
  uploadId: string,
  parts: UploadPart[],
): Promise<{ location: string; bucket: string; key: string; etag: string }> => {
  return fetchJson(`${SERVER_URL}/api/upload/complete`, {
    method: 'POST',
    body: JSON.stringify({ key, uploadId, parts }),
  });
};

/**
 * API call to abort multipart upload
 */
const abort = async (key: string, uploadId: string): Promise<void> => {
  await fetchJson(`${SERVER_URL}/api/upload/abort`, {
    method: 'POST',
    body: JSON.stringify({ key, uploadId }),
  });
};

export const uploadApi = {
  initiate,
  getSignedUrl,
  uploadChunk,
  complete,
  abort,
};
