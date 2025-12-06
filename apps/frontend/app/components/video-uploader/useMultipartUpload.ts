import { useCallback } from 'react';
import { SERVER_URL, CHUNK_SIZE } from './config';
import { withRetry } from './utils';
import type { UploadPart, UploadDetails } from './types';

interface UseMultipartUploadParams {
  file: File | null;
  setStatus: (status: 'idle' | 'ready' | 'uploading' | 'complete' | 'error') => void;
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

    setStatus('uploading');
    setProgress(0);
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    let uploadId: string | null = null;
    let fileKey: string | null = null;

    try {
      // --- Step 1 & 2: Initiate Upload ---
      const initRes = await withRetry(async () => {
        const response = await fetch(`${SERVER_URL}/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!response.ok) throw new Error('Failed to initiate upload.');
        return response.json();
      });

      uploadId = initRes.uploadId;
      fileKey = initRes.key;
      setUploadDetails(prev => ({ ...prev, uploadId, key: fileKey, totalParts }));

      const uploadedParts: UploadPart[] = [];
      let partsCompleted = 0;

      // --- Step 5, 6, 7: Chunk and Upload Parts ---
      const uploadPromises = [];

      for (let i = 0; i < totalParts; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const uploadPartPromise = async () => {
          // 6a. Get Signed URL for this part from the server
          const urlRes = await withRetry(async () => {
            const response = await fetch(`${SERVER_URL}/url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: fileKey, uploadId, partNumber }),
            });
            if (!response.ok) throw new Error(`Failed to get signed URL for part ${partNumber}`);
            return response.json();
          });

          const signedUrl = urlRes.signedUrl;

          // 6b. Upload the chunk directly to S3/MinIO
          const uploadRes = await withRetry(async () => {
            const response = await fetch(signedUrl, {
              method: 'PUT',
              body: chunk,
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
            });
            // S3 returns the ETag in the header on successful PUT
            const eTag = response.headers.get('ETag');
            if (!response.ok || !eTag) {
              throw new Error(`Part ${partNumber} upload failed.`);
            }
            return eTag.replace(/"/g, ''); // Remove quotes from ETag
          });

          // 7. Store Part Number and ETag
          uploadedParts.push({ PartNumber: partNumber, ETag: uploadRes });
          partsCompleted++;
          setUploadDetails(prev => ({ ...prev, partsUploaded: partsCompleted }));
          setProgress(Math.round((partsCompleted / totalParts) * 100));
        };

        uploadPromises.push(uploadPartPromise());
      }

      // Execute uploads in parallel
      await Promise.all(uploadPromises);

      // --- Step 8, 9, 10: Complete Upload ---
      const completeRes = await withRetry(async () => {
        const response = await fetch(`${SERVER_URL}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: fileKey, uploadId, parts: uploadedParts }),
        });
        if (!response.ok) throw new Error('Failed to complete upload.');
        return response.json();
      });

      console.log('Final Location:', completeRes.location);
      setStatus('complete');
    } catch (error) {
      console.error('Upload process failed:', error);
      setStatus('error');
      // If uploadId exists and failure happens, consider aborting the upload for cleanup
      if (uploadId && fileKey) {
        console.log('Attempting to abort upload...');
        // In a production app, you'd call an ABORT endpoint here
      }
    }
  }, [file, setStatus, setProgress, setUploadDetails]);

  return { handleUpload };
};
