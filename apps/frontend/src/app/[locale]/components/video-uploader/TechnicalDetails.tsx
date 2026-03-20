import { useTranslations } from 'next-intl';
import type { UploadDetails } from './types';
import { UploadStatus } from './types';

interface TechnicalDetailsProps {
  status: UploadStatus;
  uploadDetails: UploadDetails;
}

export const TechnicalDetails = ({ status, uploadDetails }: TechnicalDetailsProps) => {
  const t = useTranslations('videoUploader.technicalDetails');

  return (
    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('title')}</h3>
      <p>
        {t('currentStatus')} <span className="font-mono text-xs">{status}</span>
      </p>
      <p className="flex items-start gap-2">
        <span className="shrink-0">{t('uploadId')}</span>
        <span className="font-mono text-xs truncate block min-w-0">
          {uploadDetails.uploadId || t('notAvailable')}
        </span>
      </p>
      <p className="flex items-start gap-2">
        <span className="shrink-0">{t('key')}</span>
        <span className="font-mono text-xs truncate block min-w-0">
          {uploadDetails.key || t('notAvailable')}
        </span>
      </p>
    </div>
  );
};
