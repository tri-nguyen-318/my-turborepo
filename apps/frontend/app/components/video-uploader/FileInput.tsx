import { useTranslations } from 'next-intl';

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
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        onChange={onChange}
        disabled={disabled}
        className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
      />
    </div>
  );
};
