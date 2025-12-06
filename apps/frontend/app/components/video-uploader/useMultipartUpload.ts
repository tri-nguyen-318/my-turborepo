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

    console.log('🚀 [STEP 1] Starting upload for file:', file.name, 'Size:', file.size);
    setStatus('uploading');
    setProgress(0);
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    console.log('📊 Total parts to upload:', totalParts);
    let uploadId: string | null = null;
    let fileKey: string | null = null;

    try {
      // --- Step 1 & 2: Initiate Upload ---
      console.log('📤 [STEP 2] Initiating multipart upload...');
      const initRes = await withRetry(async () => {
        const response = await fetch(`${SERVER_URL}/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Initiate failed:', errorText);
          throw new Error('Failed to initiate upload.');
        }
        return response.json();
      });

      uploadId = initRes.uploadId;
      fileKey = initRes.key;
      console.log('✅ [STEP 3] Upload initiated. UploadId:', uploadId, 'Key:', fileKey);
      setUploadDetails(prev => ({ ...prev, uploadId, key: fileKey, totalParts }));

      const uploadedParts: UploadPart[] = [];
      let partsCompleted = 0;

      // --- Step 5, 6, 7: Chunk and Upload Parts ---
      console.log('📦 [STEP 4] Preparing to upload parts...');
      const uploadPromises = [];

      for (let i = 0; i < totalParts; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const uploadPartPromise = async () => {
          // 6a. Get Signed URL for this part from the server
          console.log(
            `🔗 [STEP 5.${partNumber}] Getting signed URL for part ${partNumber}/${totalParts}...`,
          );
          const urlRes = await withRetry(async () => {
            const response = await fetch(`${SERVER_URL}/url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: fileKey, uploadId, partNumber }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`❌ Failed to get URL for part ${partNumber}:`, errorText);
              throw new Error(`Failed to get signed URL for part ${partNumber}`);
            }
            return response.json();
          });

          const signedUrl = urlRes.signedUrl;
          console.log(`✅ Got signed URL for part ${partNumber}`);

          // 6b. Upload the chunk directly to S3/MinIO
          console.log(
            `⬆️ [STEP 6.${partNumber}] Uploading chunk ${partNumber} (${chunk.size} bytes)...`,
          );
          const uploadRes = await withRetry(async () => {
            const response = await fetch(signedUrl, {
              method: 'PUT',
              body: chunk,
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
            });
            // S3 returns the ETag in the header on successful PUT
            const eTag = response.headers.get('ETag');
            if (!response.ok || !eTag) {
              console.error(`❌ Part ${partNumber} upload failed. Status:`, response.status);
              throw new Error(`Part ${partNumber} upload failed.`);
            }
            console.log(`✅ Part ${partNumber} uploaded. ETag:`, eTag);
            return eTag.replace(/"/g, ''); // Remove quotes from ETag
          });

          // 7. Store Part Number and ETag
          uploadedParts.push({ PartNumber: partNumber, ETag: uploadRes });
          partsCompleted++;
          setUploadDetails(prev => ({ ...prev, partsUploaded: partsCompleted }));
          setProgress(Math.round((partsCompleted / totalParts) * 100));
          console.log(
            `📈 Progress: ${partsCompleted}/${totalParts} parts (${Math.round((partsCompleted / totalParts) * 100)}%)`,
          );
        };

        uploadPromises.push(uploadPartPromise());
      }

      // Execute uploads in parallel
      console.log(`⏳ [STEP 7] Executing ${uploadPromises.length} uploads in parallel...`);
      await Promise.all(uploadPromises);
      console.log('✅ All parts uploaded successfully!');

      // --- Step 8, 9, 10: Complete Upload ---
      console.log('🏁 [STEP 8] Completing multipart upload...');
      console.log('Parts to complete:', uploadedParts);
      const completeRes = await withRetry(async () => {
        const response = await fetch(`${SERVER_URL}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: fileKey, uploadId, parts: uploadedParts }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Complete upload failed:', errorText);
          throw new Error('Failed to complete upload.');
        }
        return response.json();
      });

      console.log('🎉 [STEP 9] Upload completed! Location:', completeRes.location);
      setStatus('complete');
    } catch (error) {
      console.error('❌ Upload process failed:', error);
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
