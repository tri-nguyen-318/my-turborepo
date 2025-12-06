import { useTranslations } from 'next-intl';

interface FileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const FileInput = ({ onChange, disabled }: FileInputProps) => {
  const t = useTranslations('videoUploader.fileInput');

  return (
    <div className="mb-6">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
        {t('label')}
      </label>
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        onChange={onChange}
        disabled={disabled}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
      />
    </div>
  );
};
