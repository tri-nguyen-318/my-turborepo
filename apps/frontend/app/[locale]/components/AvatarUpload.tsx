'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/[locale]/providers/AuthProvider';
import { uploadApi } from '@/lib/api/upload/uploadApi';
import { CHUNK_SIZE } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

interface AvatarUploadProps {
  onUploadComplete: (url: string) => void;
  onCancel: () => void;
}

export const AvatarUpload = ({ onUploadComplete, onCancel }: AvatarUploadProps) => {
  const { accessToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Initiate upload
      const { uploadId, key } = await uploadApi.initiate(file.name, file.type, accessToken);

      // 2. Upload chunks
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Get signed URL
        const { signedUrl } = await uploadApi.getSignedUrl(key, uploadId, partNumber, accessToken);

        // Upload to S3
        const etag = await uploadApi.uploadChunk(signedUrl, chunk, file.type);
        parts.push({ ETag: etag, PartNumber: partNumber });

        setProgress(Math.round((partNumber / totalParts) * 100));
      }

      // 3. Complete upload
      const result = await uploadApi.complete(key, uploadId, parts, accessToken);
      
      // Construct public URL (assuming bucket is public or proxied)
      // Since result.location might be internal minio URL, we construct a relative path or use a proxy if setup
      // For now, we'll use the result.location but you might need a getPublicUrl helper
      const publicUrl = result.location; 
      
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Avatar upload failed', error);
      // Abort if possible (requires storing key/uploadId in state, skipped for simplicity here)
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-full z-20">
      {isUploading ? (
        <div className="flex flex-col items-center text-white">
          <Loader2 className="animate-spin mb-2" />
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white hover:bg-white/20"
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
