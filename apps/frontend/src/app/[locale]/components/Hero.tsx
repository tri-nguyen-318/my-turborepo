'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApi';
import {
  useInitiateUploadMutation,
  useGetSignedUrlMutation,
  useCompleteUploadMutation,
  uploadChunk,
  type PersonalInfo,
} from '@/store/api';
import { useGetInfo, useUpdateInfo } from '@/hooks/useInfo';
import { Button } from '@/components/ui/button';
import { CHUNK_SIZE } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';
import { Database } from 'lucide-react';
import { HeroAvatar } from './HeroAvatar';
import { HeroInfo } from './HeroInfo';
import { HeroSkeleton } from './HeroSkeleton';

const OWNER_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

export const Hero = () => {
  const t = useTranslations('hero');
  const { user, accessToken, updateUser } = useAuth();
  const isAllowedToEdit = user?.email === OWNER_EMAIL;

  const [updateProfile] = useUpdateProfileMutation();
  const [initiateUpload] = useInitiateUploadMutation();
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [completeUpload] = useCompleteUploadMutation();
  const { data: fetchedInfo, isLoading } = useGetInfo();
  const updateInfoMutation = useUpdateInfo();

  const fileCvInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isDownloadingCv, setIsDownloadingCv] = useState(false);

  const handleCvDownload = async (url: string, filename: string) => {
    setIsDownloadingCv(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error(t('cvDownloadFailed'));
    } finally {
      setIsDownloadingCv(false);
    }
  };

  const hasInfo = fetchedInfo && Object.keys(fetchedInfo).length > 0;
  const info: PersonalInfo = hasInfo
    ? fetchedInfo
    : {
        name: t('defaultName'),
        role: t('defaultRole'),
        bio: t('defaultBio'),
        email: user?.email || '',
      };

  const handleFieldUpdate = async (key: keyof PersonalInfo, value: string) => {
    try {
      await updateInfoMutation.mutateAsync({ [key]: value });
    } catch {
      toast.error(t('updateFailed', { field: key }));
    }
  };

  const handleSkillsUpdate = async (skills: string[]) => {
    try {
      await updateInfoMutation.mutateAsync({ skills });
    } catch {
      toast.error(t('updateFailed', { field: 'skills' }));
    }
  };

  const handleAvatarUploaded = async (url: string) => {
    await updateProfile({ avatarUrl: url }).unwrap();
    updateUser({ avatarUrl: url });
    toast.success(t('avatarUpdated'));
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    if (file.type !== 'application/pdf') {
      toast.error(t('pdfOnly'));
      return;
    }

    setIsUploadingCv(true);
    try {
      const { uploadId, key, bucket } = await initiateUpload({
        filename: file.name,
        contentType: file.type,
        isPublic: true,
      }).unwrap();
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const { signedUrl } = await getSignedUrl({ bucket, key, uploadId, partNumber }).unwrap();
        parts.push({
          ETag: await uploadChunk(
            signedUrl,
            file.slice(start, Math.min(start + CHUNK_SIZE, file.size)),
          ),
          PartNumber: partNumber,
        });
      }
      const { location } = await completeUpload({
        bucket,
        key,
        uploadId,
        parts,
        isPublic: true,
      }).unwrap();
      await updateInfoMutation.mutateAsync({ cvUrl: location });
      toast.success(t('cvUploaded'));
    } catch {
      toast.error(t('cvUploadFailed'));
    } finally {
      setIsUploadingCv(false);
      if (fileCvInputRef.current) fileCvInputRef.current.value = '';
    }
  };

  if (isLoading) return <HeroSkeleton />;

  return (
    <section className="relative mb-8 w-full overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-primary/10 via-background to-secondary/10 py-12 shadow-sm md:py-24 lg:py-32">
      <p className="absolute top-3 right-3 flex items-center gap-1 text-xs text-muted-foreground/60">
        <Database className="h-3 w-3" />
        {t('managedByCms')}
      </p>
      <div className="container px-4 md:px-6">
        <div className="mb-4 flex justify-end gap-2">
          {fetchedInfo?.cvUrl &&
            (() => {
              const rawName = decodeURIComponent(fetchedInfo.cvUrl.split('/').pop() ?? 'CV.pdf');
              const cvFileName = rawName.split('-').slice(2).join('-') || rawName;
              return (
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={isDownloadingCv}
                  onClick={() => handleCvDownload(fetchedInfo.cvUrl!, cvFileName)}
                >
                  <Download className="h-4 w-4" />
                  {t('downloadCv')}
                  <span className="text-xs text-muted-foreground">{cvFileName}</span>
                </Button>
              );
            })()}
          {isAllowedToEdit && (
            <>
              <Button
                variant="default"
                className="gap-2"
                disabled={isUploadingCv}
                onClick={() => fileCvInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {isUploadingCv ? t('uploadingCv') : t('uploadCv')}
              </Button>
              <input
                ref={fileCvInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleCvFileChange}
              />
            </>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-8 md:flex-row md:gap-12">
          <HeroAvatar
            avatarUrl={fetchedInfo?.avatarUrl || user?.avatarUrl || ''}
            name={info.name}
            isAllowedToEdit={isAllowedToEdit}
            onAvatarUploaded={handleAvatarUploaded}
          />
          <HeroInfo
            info={info}
            isAllowedToEdit={isAllowedToEdit}
            onFieldUpdate={handleFieldUpdate}
            onSkillsUpdate={handleSkillsUpdate}
          />
        </div>
      </div>
    </section>
  );
};
