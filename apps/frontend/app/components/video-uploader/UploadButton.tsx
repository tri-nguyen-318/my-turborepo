import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { UploadStatus } from './types';

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  status: UploadStatus;
  isUploading: boolean;
}

export const UploadButton = ({ onClick, disabled, status, isUploading }: UploadButtonProps) => {
  const t = useTranslations('videoUploader.button');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-sm transition-colors duration-200 ${
        !disabled
          ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          : 'bg-indigo-300 cursor-not-allowed'
      }`}
    >
      {isUploading ? (
        <>
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          {t('uploading')}
        </>
      ) : status === 'complete' ? (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          {t('complete')}
        </>
      ) : status === 'error' ? (
        <>
          <XCircle className="w-5 h-5 mr-2" />
          {t('retry')}
        </>
      ) : (
        t('start')
      )}
    </button>
  );
};
