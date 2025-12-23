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
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            {t('fileUrl')}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fileUrl}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={e => e.currentTarget.select()}
            />
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white dark:bg-gray-800 border border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors duration-200 cursor-pointer"
              title={t('openFile')}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fileUrl);
              }}
              className="p-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 cursor-pointer"
              title={t('copyUrl')}
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={onReset}
        className="w-full px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 cursor-pointer"
      >
        {t('uploadAnother')}
      </button>
    </div>
  );
};
