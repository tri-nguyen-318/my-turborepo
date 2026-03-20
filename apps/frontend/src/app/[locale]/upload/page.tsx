import VideoUploader from '../components/video-uploader';

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl">
        <VideoUploader />
      </div>
    </main>
  );
}
