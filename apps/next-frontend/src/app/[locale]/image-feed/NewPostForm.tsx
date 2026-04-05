'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreatePostMutation } from '@/store/api';
import { useMultipartUpload } from '@/app/[locale]/components/video-uploader/useMultipartUpload';
import { UploadStatus, type UploadDetails } from '@/app/[locale]/components/video-uploader/types';

const EMPTY_DETAILS: UploadDetails = {
  uploadId: null,
  key: null,
  location: null,
  partsUploaded: 0,
  totalParts: 0,
};

export function NewPostForm() {
  const t = useTranslations('imageFeed');
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurDataUrl, setBlurDataUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [_uploadDetails, setUploadDetailsState] = useState<UploadDetails>(EMPTY_DETAILS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture location in a ref so it's readable synchronously after upload
  const locationRef = useRef<string | null>(null);
  function setUploadDetails(updater: React.SetStateAction<UploadDetails>) {
    setUploadDetailsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.location) locationRef.current = next.location;
      return next;
    });
  }

  const { handleUpload } = useMultipartUpload({
    file,
    setStatus,
    setProgress,
    setUploadDetails,
  });

  const [createPost, { isLoading: isPosting }] = useCreatePostMutation();

  function generateBlurDataUrl(file: File): Promise<string> {
    return new Promise(resolve => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 6;
        canvas.getContext('2d')!.drawImage(img, 0, 0, 8, 6);
        resolve(canvas.toDataURL('image/jpeg', 0.1));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStatus(UploadStatus.IDLE);
    setProgress(0);
    setUploadDetails(EMPTY_DETAILS);
    locationRef.current = null;
    const blur = await generateBlurDataUrl(selected);
    setBlurDataUrl(blur);
  }

  function handleRemoveFile() {
    setFile(null);
    setPreview(null);
    setBlurDataUrl(undefined);
    setStatus(UploadStatus.IDLE);
    setProgress(0);
    setUploadDetails(EMPTY_DETAILS);
    locationRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    setOpen(false);
    setCaption('');
    handleRemoveFile();
  }

  async function handleSubmit() {
    if (!file || !caption.trim()) return;

    await handleUpload();

    const url = locationRef.current;
    if (!url) return; // upload failed

    try {
      await createPost({ url, caption: caption.trim(), blurDataUrl }).unwrap();
      handleClose();
    } catch {
      // stay open on error
    }
  }

  const isUploading = status === UploadStatus.UPLOADING;
  const uploadError = status === UploadStatus.ERROR;
  const isBusy = isUploading || isPosting;
  const canSubmit = !!file && !!caption.trim() && !isBusy;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <ImagePlus className="mr-1.5 h-4 w-4" />
        {t('newPost')}
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('newPost')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Image picker */}
            {!file ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">{t('newPostPickImage')}</span>
                <span className="text-xs">{t('newPostPickImageHint')}</span>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-xl">
                <img src={preview!} alt="" className="aspect-4/3 w-full object-cover" />
                {!isBusy && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                    <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{progress}%</span>
                  </div>
                )}
              </div>
            )}

            {uploadError && <p className="text-sm text-destructive">{t('newPostUploadError')}</p>}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Caption */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('newPostCaptionLabel')}</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder={t('newPostCaptionPlaceholder')}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {isUploading
                  ? t('newPostUploading', { progress })
                  : isPosting
                    ? t('newPostPosting')
                    : t('newPostSubmit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
