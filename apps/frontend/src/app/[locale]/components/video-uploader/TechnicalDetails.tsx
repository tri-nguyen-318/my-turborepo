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
    <div className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">{t('title')}</h3>
      <p>
        {t('currentStatus')} <span className="font-mono text-xs">{status}</span>
      </p>
      <p className="flex items-start gap-2">
        <span className="shrink-0">{t('uploadId')}</span>
        <span className="block min-w-0 truncate font-mono text-xs">
          {uploadDetails.uploadId || t('notAvailable')}
        </span>
      </p>
      <p className="flex items-start gap-2">
        <span className="shrink-0">{t('key')}</span>
        <span className="block min-w-0 truncate font-mono text-xs">
          {uploadDetails.key || t('notAvailable')}
        </span>
      </p>
    </div>
  );
};
