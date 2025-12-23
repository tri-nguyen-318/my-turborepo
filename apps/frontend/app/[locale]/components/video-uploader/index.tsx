'use client';

import { useState, useMemo } from 'react';
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

const VideoUploader = () => {
  const t = useTranslations('videoUploader');
  const tProgress = useTranslations('videoUploader.progress');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [inputKey, setInputKey] = useState(0);
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
      setStatus(UploadStatus.READY);
      setUploadDetails({ uploadId: null, key: null, partsUploaded: 0, totalParts: 0 });
    }
  };

  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setStatus(UploadStatus.IDLE);
    setUploadDetails({ uploadId: null, key: null, partsUploaded: 0, totalParts: 0 });
    setInputKey(prev => prev + 1);
  };

  const fileUrl = uploadDetails.key
    ? `http://localhost:9000/video-uploads/${uploadDetails.key}`
    : null;

  const displayProgress = useMemo(() => {
    if (status === UploadStatus.COMPLETE) return tProgress('complete');
    if (status === UploadStatus.ERROR) return tProgress('error');
    return `${progress}%`;
  }, [progress, status, tProgress]);

  const isUploading = status === UploadStatus.UPLOADING;
  const canUpload = file && status !== UploadStatus.UPLOADING;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <FileUp className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
            {t('title')}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('description')}</p>

        <FileInput key={inputKey} onChange={handleFileChange} disabled={isUploading} />

        {file && <FileDetails file={file} uploadDetails={uploadDetails} />}

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
      </div>
    </div>
  );
};

export default VideoUploader;
