'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FileUp } from 'lucide-react';
import { FileInput } from './FileInput';
import { FileDetails } from './FileDetails';
import { ProgressBar } from './ProgressBar';
import { UploadButton } from './UploadButton';
import { TechnicalDetails } from './TechnicalDetails';
import { useMultipartUpload } from './useMultipartUpload';
import type { UploadStatus, UploadDetails } from './types';

const VideoUploader = () => {
  const t = useTranslations('videoUploader');
  const tProgress = useTranslations('videoUploader.progress');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadDetails, setUploadDetails] = useState<UploadDetails>({
    uploadId: null,
    key: null,
    partsUploaded: 0,
    totalParts: 0,
  });

  const { handleUpload } = useMultipartUpload({
    file,
    setStatus,
    setProgress,
    setUploadDetails,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProgress(0);
      setStatus('ready');
      setUploadDetails({ uploadId: null, key: null, partsUploaded: 0, totalParts: 0 });
    }
  };

  const displayProgress = useMemo(() => {
    if (status === 'complete') return tProgress('complete');
    if (status === 'error') return tProgress('error');
    return `${progress}%`;
  }, [progress, status, tProgress]);

  const isUploading = status === 'uploading';
  const canUpload = file && status !== 'uploading';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FileUp className="w-7 h-7 mr-3 text-indigo-600" />
          {t('title')}
        </h1>
        <p className="text-gray-500 mb-6">{t('description')}</p>

        <FileInput onChange={handleFileChange} disabled={isUploading} />

        {file && <FileDetails file={file} uploadDetails={uploadDetails} />}

        <ProgressBar
          status={status}
          progress={progress}
          displayProgress={displayProgress}
          uploadDetails={uploadDetails}
          isUploading={isUploading}
        />

        <UploadButton
          onClick={handleUpload}
          disabled={!canUpload}
          status={status}
          isUploading={isUploading}
        />

        <TechnicalDetails status={status} uploadDetails={uploadDetails} />
      </div>
    </div>
  );
};

export default VideoUploader;
