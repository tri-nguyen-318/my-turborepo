import { useCallback } from 'react';
import { CHUNK_SIZE, MAX_CONCURRENT_UPLOADS } from './config';
import type { UploadPart, UploadDetails } from './types';
import { UploadStatus } from './types';
import {
  initiateMultipartUpload,
  uploadSinglePart,
  completeMultipartUpload,
  abortMultipartUpload,
} from './uploadHelpers';

interface UseMultipartUploadParams {
  file: File | null;
  setStatus: (status: UploadStatus) => void;
  setProgress: (progress: number) => void;
  setUploadDetails: React.Dispatch<React.SetStateAction<UploadDetails>>;
}

export const useMultipartUpload = ({
  file,
  setStatus,
  setProgress,
  setUploadDetails,
}: UseMultipartUploadParams) => {
  const handleUpload = useCallback(async () => {
    if (!file) return;

    console.log('🚀 [STEP 1] Starting upload for file:', file.name, 'Size:', file.size);
    setStatus(UploadStatus.UPLOADING);
    setProgress(0);
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    console.log('📊 Total parts to upload:', totalParts);
    let uploadId: string | null = null;
    let fileKey: string | null = null;

    try {
      // Initiate multipart upload
      const initRes = await initiateMultipartUpload(file.name, file.type);
      uploadId = initRes.uploadId;
      fileKey = initRes.key;
      setUploadDetails(prev => ({ ...prev, uploadId, key: fileKey, totalParts }));

      const uploadedParts: UploadPart[] = [];
      let partsCompleted = 0;

      // Upload parts in batches
      console.log('📦 [STEP 4] Preparing to upload parts...');
      console.log(`⚙️ Max concurrent uploads: ${MAX_CONCURRENT_UPLOADS}`);

      const uploadPartsBatch = async (startIndex: number, endIndex: number) => {
        const batchPromises = [];

        for (let i = startIndex; i < endIndex && i < totalParts; i++) {
          const partNumber = i + 1;

          const uploadPartPromise = async () => {
            const part = await uploadSinglePart(file, fileKey!, uploadId!, partNumber, totalParts);
            uploadedParts.push(part);
            partsCompleted++;
            setUploadDetails(prev => ({ ...prev, partsUploaded: partsCompleted }));
            setProgress(Math.round((partsCompleted / totalParts) * 100));
            console.log(
              `📈 Progress: ${partsCompleted}/${totalParts} parts (${Math.round((partsCompleted / totalParts) * 100)}%)`,
            );
          };

          batchPromises.push(uploadPartPromise());
        }

        return Promise.all(batchPromises);
      };

      // Execute uploads in batches
      console.log(
        `⏳ [STEP 7] Uploading ${totalParts} parts in batches of ${MAX_CONCURRENT_UPLOADS}...`,
      );
      for (let i = 0; i < totalParts; i += MAX_CONCURRENT_UPLOADS) {
        const batchEnd = Math.min(i + MAX_CONCURRENT_UPLOADS, totalParts);
        console.log(`📦 Uploading batch: parts ${i + 1}-${batchEnd}`);
        await uploadPartsBatch(i, batchEnd);
      }
      console.log('✅ All parts uploaded successfully!');

      // Sort parts and complete upload
      uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
      await completeMultipartUpload(fileKey, uploadId, uploadedParts);
      setStatus(UploadStatus.COMPLETE);
    } catch (error) {
      console.error('❌ Upload process failed:', error);
      setStatus(UploadStatus.ERROR);

      // Abort upload for cleanup
      if (uploadId && fileKey) {
        await abortMultipartUpload(fileKey, uploadId);
      }
    }
  }, [file, setStatus, setProgress, setUploadDetails]);

  return { handleUpload };
};
