import { store } from '@/store/store';
import { uploadChunk } from '@/store/api';
import { uploadApi } from '@/store/api/uploadApi';
import { CHUNK_SIZE } from './config';
import type { UploadPart } from './types';

const withRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry limit exceeded');
};

export const initiateMultipartUpload = async (
  filename: string,
  contentType: string,
  isPublic: boolean,
): Promise<{ uploadId: string; key: string; bucket: string }> => {
  console.log('📤 [STEP 2] Initiating multipart upload...');
  const initRes = await withRetry(() =>
    store
      .dispatch(uploadApi.endpoints.initiateUpload.initiate({ filename, contentType, isPublic }))
      .unwrap(),
  );
  console.log('✅ [STEP 3] Upload initiated. UploadId:', initRes.uploadId, 'Key:', initRes.key);
  return initRes;
};

export const getSignedUploadUrl = async (
  bucket: string,
  fileKey: string,
  uploadId: string,
  partNumber: number,
  totalParts: number,
): Promise<string> => {
  console.log(
    `🔗 [STEP 5.${partNumber}] Getting signed URL for part ${partNumber}/${totalParts}...`,
  );
  const urlRes = await withRetry(() =>
    store
      .dispatch(
        uploadApi.endpoints.getSignedUrl.initiate({ bucket, key: fileKey, uploadId, partNumber }),
      )
      .unwrap(),
  );
  console.log(`✅ Got signed URL for part ${partNumber}`);
  return urlRes.signedUrl;
};

export const uploadChunkToS3 = async (
  signedUrl: string,
  chunk: Blob,
  partNumber: number,
): Promise<string> => {
  console.log(`⬆️ [STEP 6.${partNumber}] Uploading chunk ${partNumber} (${chunk.size} bytes)...`);
  const eTag = await withRetry(() => uploadChunk(signedUrl, chunk));
  console.log(`✅ Part ${partNumber} uploaded. ETag:`, eTag);
  return eTag;
};

export const uploadSinglePart = async (
  file: File,
  bucket: string,
  fileKey: string,
  uploadId: string,
  partNumber: number,
  totalParts: number,
): Promise<UploadPart> => {
  const start = (partNumber - 1) * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  const chunk = file.slice(start, end);

  const signedUrl = await getSignedUploadUrl(bucket, fileKey, uploadId, partNumber, totalParts);
  const eTag = await uploadChunkToS3(signedUrl, chunk, partNumber);

  return { PartNumber: partNumber, ETag: eTag };
};

export const completeMultipartUpload = async (
  bucket: string,
  fileKey: string,
  uploadId: string,
  parts: UploadPart[],
  isPublic: boolean,
): Promise<{ location: string }> => {
  console.log('🏁 [STEP 8] Completing multipart upload...');
  const completeRes = await withRetry(() =>
    store
      .dispatch(
        uploadApi.endpoints.completeUpload.initiate({
          bucket,
          key: fileKey,
          uploadId,
          parts,
          isPublic,
        }),
      )
      .unwrap(),
  );
  console.log('🎉 [STEP 9] Upload completed! Location:', completeRes.location);
  return completeRes;
};

export const abortMultipartUpload = async (
  bucket: string,
  fileKey: string,
  uploadId: string,
): Promise<void> => {
  console.log('🗑️ Attempting to abort incomplete upload...');
  try {
    await store
      .dispatch(uploadApi.endpoints.abortUpload.initiate({ bucket, key: fileKey, uploadId }))
      .unwrap();
    console.log('✅ Upload aborted successfully');
  } catch (error) {
    console.error('❌ Error while aborting upload:', error);
  }
};
