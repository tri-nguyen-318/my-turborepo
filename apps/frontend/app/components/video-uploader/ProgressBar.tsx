import { useTranslations } from 'next-intl';
import type { UploadStatus, UploadDetails } from './types';

interface ProgressBarProps {
  status: UploadStatus;
  progress: number;
  displayProgress: string;
  uploadDetails: UploadDetails;
  isUploading: boolean;
}

export const ProgressBar = ({
  status,
  progress,
  displayProgress,
  uploadDetails,
  isUploading,
}: ProgressBarProps) => {
  const t = useTranslations('videoUploader.progress');

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700">{t('uploadStatus')}</span>
        <span
          className={`text-sm font-semibold ${status === 'complete' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-indigo-600'}`}
        >
          {displayProgress}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${status === 'complete' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-indigo-600'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {isUploading && (
        <p className="text-xs text-gray-500 mt-2">
          {t('uploadingPart', {
            current: uploadDetails.partsUploaded,
            total: uploadDetails.totalParts,
          })}
        </p>
      )}
    </div>
  );
};
