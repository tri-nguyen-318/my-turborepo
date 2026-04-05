import { useTranslations } from 'next-intl';
import { ExternalLink, Copy } from 'lucide-react';

interface UploadCompleteProps {
  fileUrl: string | null;
  onReset: () => void;
}

export const UploadComplete = ({ fileUrl, onReset }: UploadCompleteProps) => {
  const t = useTranslations('videoUploader');

  return (
    <div className="mt-4 space-y-3">
      {fileUrl && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="mb-2 text-sm font-medium text-green-900 dark:text-green-100">
            {t('fileUrl')}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fileUrl}
              className="flex-1 rounded border border-green-300 bg-white px-3 py-2 font-mono text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-green-700 dark:bg-gray-800 dark:text-gray-300"
              onClick={e => e.currentTarget.select()}
            />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded border border-green-600 bg-white p-2 text-green-700 transition-colors duration-200 hover:bg-green-50 dark:border-green-500 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/30"
              title={t('openFile')}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fileUrl);
              }}
              className="cursor-pointer rounded bg-green-600 p-2 text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              title={t('copyUrl')}
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={onReset}
        className="w-full cursor-pointer rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
      >
        {t('uploadAnother')}
      </button>
    </div>
  );
};
