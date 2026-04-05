import { useTranslations } from 'next-intl';
import type { UploadDetails } from './types';

interface FileDetailsProps {
  file: File;
  uploadDetails: UploadDetails;
}

export const FileDetails = ({ file, uploadDetails }: FileDetailsProps) => {
  const t = useTranslations('videoUploader.fileDetails');

  return (
    <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
      <p className="font-semibold text-indigo-800 dark:text-indigo-100">{t('title')}</p>
      <p className="truncate text-sm text-indigo-700 dark:text-indigo-300">{file.name}</p>
      <p className="text-xs text-indigo-600 dark:text-indigo-400">
        {t('size', { size: (file.size / (1024 * 1024)).toFixed(2) })}
      </p>
      <p className="text-xs text-indigo-600 dark:text-indigo-400">
        {t('totalChunks', { chunks: uploadDetails.totalParts })}
      </p>
    </div>
  );
};
