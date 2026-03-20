import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadStatus } from './types';

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  status: UploadStatus;
  isUploading: boolean;
}

export const UploadButton = ({ onClick, disabled, status, isUploading }: UploadButtonProps) => {
  const t = useTranslations('videoUploader.button');

  return (
    <Button onClick={onClick} disabled={disabled} className="w-full">
      {isUploading ? (
        <>
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          {t('uploading')}
        </>
      ) : status === UploadStatus.COMPLETE ? (
        <>
          <CheckCircle className="mr-3 h-5 w-5" />
          {t('complete')}
        </>
      ) : status === UploadStatus.ERROR ? (
        <>
          <XCircle className="mr-2 h-5 w-5" />
          {t('retry')}
        </>
      ) : (
        t('start')
      )}
    </Button>
  );
};
