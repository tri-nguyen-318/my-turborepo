import { useTranslations } from 'next-intl';
import type { UploadDetails } from './types';

interface FileDetailsProps {
  file: File;
  uploadDetails: UploadDetails;
}

export const FileDetails = ({ file, uploadDetails }: FileDetailsProps) => {
  const t = useTranslations('videoUploader.fileDetails');

  return (
    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <p className="font-semibold text-indigo-800">{t('title')}</p>
      <p className="text-sm text-indigo-700 truncate">{file.name}</p>
      <p className="text-xs text-indigo-600">
        {t('size', { size: (file.size / (1024 * 1024)).toFixed(2) })}
      </p>
      <p className="text-xs text-indigo-600">
        {t('totalChunks', { chunks: uploadDetails.totalParts })}
      </p>
    </div>
  );
};
