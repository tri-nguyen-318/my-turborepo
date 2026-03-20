import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';

interface FileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const FileInput = ({ onChange, disabled }: FileInputProps) => {
  const t = useTranslations('videoUploader.fileInput');

  return (
    <div className="mb-6">
      <label
        htmlFor="file-upload"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {t('label')}
      </label>
      <Input
        id="file-upload"
        type="file"
        accept="image/*,video/*"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};
