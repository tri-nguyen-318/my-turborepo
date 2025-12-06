import { useTranslations } from 'next-intl';
import type { UploadStatus, UploadDetails } from './types';

interface TechnicalDetailsProps {
  status: UploadStatus;
  uploadDetails: UploadDetails;
}

export const TechnicalDetails = ({ status, uploadDetails }: TechnicalDetailsProps) => {
  const t = useTranslations('videoUploader.technicalDetails');

  return (
    <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
      <h3 className="font-semibold text-gray-700 mb-2">{t('title')}</h3>
      <p>
        {t('currentStatus')} <span className="font-mono text-xs">{status}</span>
      </p>
      <p>
        {t('uploadId')}{' '}
        <span className="font-mono text-xs truncate">
          {uploadDetails.uploadId || t('notAvailable')}
        </span>
      </p>
      <p>
        {t('key')}{' '}
        <span className="font-mono text-xs truncate">{uploadDetails.key || t('notAvailable')}</span>
      </p>
    </div>
  );
};
