import { useTranslations } from 'next-intl';
import type { UploadDetails } from './types';
import { UploadStatus } from './types';

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

  // Don't show progress bar if not uploading, complete, or error
  if (status === UploadStatus.IDLE || status === UploadStatus.READY) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('uploadStatus')}
        </span>
        <span
          className={`text-sm font-semibold ${status === UploadStatus.COMPLETE ? 'text-green-600 dark:text-green-400' : status === UploadStatus.ERROR ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}
        >
          {displayProgress}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${status === UploadStatus.COMPLETE ? 'bg-green-500 dark:bg-green-600' : status === UploadStatus.ERROR ? 'bg-red-500 dark:bg-red-600' : 'bg-indigo-600 dark:bg-indigo-500'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {isUploading && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('uploadingPart', {
            current: uploadDetails.partsUploaded,
            total: uploadDetails.totalParts,
          })}
        </p>
      )}
    </div>
  );
};
