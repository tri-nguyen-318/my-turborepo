import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import VideoUploader from '../components/video-uploader';
import { FileRepository } from '../components/FileRepository';

export const metadata: Metadata = {
  title: 'Upload',
  description: 'Upload and manage your files with multipart S3 upload support.',
};

export default async function UploadPage() {
  const t = await getTranslations('repository');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 bg-background px-4 py-12">
      <section className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <VideoUploader />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <FileRepository />
      </section>
    </main>
  );
}
