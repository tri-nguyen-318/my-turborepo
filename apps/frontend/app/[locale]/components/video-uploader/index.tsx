'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FileUp } from 'lucide-react';
import { FileInput } from './FileInput';
import { FileDetails } from './FileDetails';
import { ProgressBar } from './ProgressBar';
import { UploadButton } from './UploadButton';
import { UploadComplete } from './UploadComplete';
import { TechnicalDetails } from './TechnicalDetails';
import { useMultipartUpload } from './useMultipartUpload';
import type { UploadDetails } from './types';
import { UploadStatus } from './types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from './cropImage';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const VideoUploader = () => {
  const t = useTranslations('videoUploader');
  const tProgress = useTranslations('videoUploader.progress');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [inputKey, setInputKey] = useState(0);
  const [uploadDetails, setUploadDetails] = useState<UploadDetails>({
    uploadId: null,
    key: null,
    partsUploaded: 0,
    totalParts: 0,
  });
  type FormValues = { file: File | null };
  const { control, reset, watch } = useForm<FormValues>({ defaultValues: { file: null } });
  const file = watch('file');
  const [cropOpen, setCropOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(1);

  const { handleUpload } = useMultipartUpload({
    file,
    setStatus,
    setProgress,
    setUploadDetails,
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      setProgress(0);
      setStatus(UploadStatus.READY);
      setUploadDetails({ uploadId: null, key: null, partsUploaded: 0, totalParts: 0 });
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setCropOpen(true);
        setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
        setNaturalSize(null);
      }
    }
  };

  const handleReset = () => {
    reset();
    setProgress(0);
    setStatus(UploadStatus.IDLE);
    setUploadDetails({ uploadId: null, key: null, partsUploaded: 0, totalParts: 0 });
    setInputKey(prev => prev + 1);
  };

  const fileUrl = uploadDetails.key
    ? `${process.env.NEXT_PUBLIC_MINIO_URL}/video-uploads/${uploadDetails.key}`
    : null;

  const displayProgress = useMemo(() => {
    if (status === UploadStatus.COMPLETE) return tProgress('complete');
    if (status === UploadStatus.ERROR) return tProgress('error');
    return `${progress}%`;
  }, [progress, status, tProgress]);

  const isUploading = status === UploadStatus.UPLOADING;
  const canUpload = file && status !== UploadStatus.UPLOADING;

  const handleCropConfirm = async () => {
    if (!file || !imagePreview || !file.type.startsWith('image/')) {
      setCropOpen(false);
      return;
    }
    let blob: Blob | null = null;
    if (naturalSize) {
      const pixelCrop = {
        x: Math.round(((crop.x || 0) * naturalSize.w) / 100),
        y: Math.round(((crop.y || 0) * naturalSize.h) / 100),
        width: Math.round(((crop.width || 0) * naturalSize.w) / 100),
        height: Math.round(((crop.height || 0) * naturalSize.h) / 100),
      };
      blob = await getCroppedImg(imagePreview, pixelCrop);
    }
    if (blob) {
      const croppedFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}-cropped.jpg`, {
        type: 'image/jpeg',
      });
      reset({ file: croppedFile });
    }
    URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setCropOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileUp className="w-7 h-7" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>

        <Controller
          name="file"
          control={control}
          render={({ field: { onChange } }) => (
            <FileInput
              key={inputKey}
              onChange={e => {
                const file = e.target.files?.[0] || null;
                onChange(file);
                handleFileChange(file);
              }}
              disabled={isUploading}
            />
          )}
        />

        {/* FileDetails expects a file, so get it from react-hook-form */}
        <Controller
          name="file"
          control={control}
          render={({ field: { value } }) =>
            value ? <FileDetails file={value} uploadDetails={uploadDetails} /> : <></>
          }
        />

        {status === UploadStatus.COMPLETE && (
          <div className="mb-6 border-t border-gray-200 dark:border-gray-700"></div>
        )}

        <ProgressBar
          status={status}
          progress={progress}
          displayProgress={displayProgress}
          uploadDetails={uploadDetails}
          isUploading={isUploading}
        />

        {status !== UploadStatus.COMPLETE && (
          <UploadButton
            onClick={handleUpload}
            disabled={!canUpload}
            status={status}
            isUploading={isUploading}
          />
        )}

        {status === UploadStatus.COMPLETE && (
          <UploadComplete fileUrl={fileUrl} onReset={handleReset} />
        )}

        <TechnicalDetails status={status} uploadDetails={uploadDetails} />
        </CardContent>
      </Card>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Drag corners to resize; drag inside to move</div>
                <Select
                  value={aspect ? String(aspect) : 'free'}
                  onValueChange={v => setAspect(v === 'free' ? undefined : Number(v))}
                >
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Aspect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="1">1:1</SelectItem>
                    <SelectItem value="1.3333333333">4:3</SelectItem>
                    <SelectItem value="1.7777777778">16:9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative h-80 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <ReactCrop crop={crop} onChange={(c: Crop) => setCrop(c)} aspect={aspect}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-80"
                    onLoad={e => {
                      const img = e.currentTarget;
                      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                    }}
                  />
                </ReactCrop>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCropOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCropConfirm}>Confirm Crop</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoUploader;
