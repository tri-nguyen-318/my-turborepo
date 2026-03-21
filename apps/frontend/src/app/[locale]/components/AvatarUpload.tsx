'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { CHUNK_SIZE } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';
import {
  useInitiateUploadMutation,
  useGetSignedUrlMutation,
  useCompleteUploadMutation,
  uploadChunk,
} from '@/store/api';

interface AvatarUploadProps {
  onUploadComplete: (url: string) => void;
  onCancel: () => void;
}

export const AvatarUpload = ({ onUploadComplete, onCancel }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initiateUpload] = useInitiateUploadMutation();
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [completeUpload] = useCompleteUploadMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const { uploadId, key } = await initiateUpload({
        filename: file.name,
        contentType: file.type,
      }).unwrap();

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

        const { signedUrl } = await getSignedUrl({ key, uploadId, partNumber }).unwrap();
        const etag = await uploadChunk(signedUrl, chunk);
        parts.push({ ETag: etag, PartNumber: partNumber });

        setProgress(Math.round((partNumber / totalParts) * 100));
      }

      const result = await completeUpload({ key, uploadId, parts }).unwrap();
      onUploadComplete(result.location);
    } catch (error) {
      console.error('Avatar upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/60">
      {isUploading ? (
        <div className="flex flex-col items-center text-white">
          <Loader2 className="mb-2 animate-spin" />
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};
