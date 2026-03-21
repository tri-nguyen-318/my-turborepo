'use client';

import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, X, Loader2 } from 'lucide-react';
import { CHUNK_SIZE } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';
import {
  useInitiateUploadMutation,
  useGetSignedUrlMutation,
  useCompleteUploadMutation,
  uploadChunk,
} from '@/store/api';
import { useTranslations } from 'next-intl';

interface AvatarUploadProps {
  onUploadComplete: (url: string) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = url;
  });

const OUTPUT_SIZE = 512;

const getCroppedBlob = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95));
};

export const AvatarUpload = ({ onUploadComplete, onCancel }: AvatarUploadProps) => {
  const t = useTranslations('videoUploader.crop');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [initiateUpload] = useInitiateUploadMutation();
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [completeUpload] = useCompleteUploadMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setImageSrc(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      const { uploadId, key, bucket } = await initiateUpload({
        filename: file.name,
        contentType: file.type,
        isPublic: true,
      }).unwrap();

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
        const { signedUrl } = await getSignedUrl({ bucket, key, uploadId, partNumber }).unwrap();
        const etag = await uploadChunk(signedUrl, chunk);
        parts.push({ ETag: etag, PartNumber: partNumber });
        setProgress(Math.round((partNumber / totalParts) * 100));
      }

      const result = await completeUpload({
        bucket,
        key,
        uploadId,
        parts,
        isPublic: true,
      }).unwrap();
      onUploadComplete(result.location);
    } catch (error) {
      console.error('Avatar upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
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

      <Dialog
        open={!!imageSrc}
        onOpenChange={open => {
          if (!open) setImageSrc(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">{t('hint')}</p>
          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageSrc(null)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleConfirmCrop}>{t('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
