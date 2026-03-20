import { CHUNK_SIZE } from './config';
import { withRetry } from '@/lib/utils/utils';
import type { UploadPart } from './types';
import { uploadApi } from '@/lib/api';

/**
 * Initiates a multipart upload session with the backend
 */
export const initiateMultipartUpload = async (
  filename: string,
  contentType: string,
  token: string,
): Promise<{ uploadId: string; key: string }> => {
  console.log('📤 [STEP 2] Initiating multipart upload...');
  const initRes = await withRetry(() => uploadApi.initiate(filename, contentType, token));
  console.log('✅ [STEP 3] Upload initiated. UploadId:', initRes.uploadId, 'Key:', initRes.key);
  return initRes;
};

/**
 * Gets a signed URL for uploading a specific part
 */
export const getSignedUploadUrl = async (
  fileKey: string,
  uploadId: string,
  partNumber: number,
  totalParts: number,
  token: string,
): Promise<string> => {
  console.log(
    `🔗 [STEP 5.${partNumber}] Getting signed URL for part ${partNumber}/${totalParts}...`,
  );
  const urlRes = await withRetry(() =>
    uploadApi.getSignedUrl(fileKey, uploadId, partNumber, token),
  );
  console.log(`✅ Got signed URL for part ${partNumber}`);
  return urlRes.signedUrl;
};

/**
 * Uploads a single chunk to S3/MinIO using a signed URL
 */
export const uploadChunkToS3 = async (
  signedUrl: string,
  chunk: Blob,
  partNumber: number,
  contentType: string,
): Promise<string> => {
  console.log(`⬆️ [STEP 6.${partNumber}] Uploading chunk ${partNumber} (${chunk.size} bytes)...`);
  const eTag = await withRetry(() => uploadApi.uploadChunk(signedUrl, chunk, contentType));
  console.log(`✅ Part ${partNumber} uploaded. ETag:`, eTag);
  return eTag;
};

/**
 * Uploads a single part (get signed URL + upload chunk)
 */
export const uploadSinglePart = async (
  file: File,
  fileKey: string,
  uploadId: string,
  partNumber: number,
  totalParts: number,
  token: string,
): Promise<UploadPart> => {
  const start = (partNumber - 1) * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  const chunk = file.slice(start, end);

  const signedUrl = await getSignedUploadUrl(fileKey, uploadId, partNumber, totalParts, token);
  const eTag = await uploadChunkToS3(signedUrl, chunk, partNumber, file.type);

  return { PartNumber: partNumber, ETag: eTag };
};

/**
 * Completes the multipart upload
 */
export const completeMultipartUpload = async (
  fileKey: string,
  uploadId: string,
  parts: UploadPart[],
  token: string,
): Promise<{ location: string }> => {
  console.log('🏁 [STEP 8] Completing multipart upload...');
  console.log('Parts to complete:', parts);

  const completeRes = await withRetry(() => uploadApi.complete(fileKey, uploadId, parts, token));
  console.log('🎉 [STEP 9] Upload completed! Location:', completeRes.location);
  return completeRes;
};

/**
 * Aborts a multipart upload for cleanup
 */
export const abortMultipartUpload = async (
  fileKey: string,
  uploadId: string,
  token: string,
): Promise<void> => {
  console.log('🗑️ Attempting to abort incomplete upload...');
  try {
    await uploadApi.abort(fileKey, uploadId, token);
    console.log('✅ Upload aborted successfully');
  } catch (error) {
    console.error('❌ Error while aborting upload:', error);
  }
};
