import VideoUploader from '../components/video-uploader';

export default function UploadPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full">
        <VideoUploader />
      </div>
    </main>
  );
}
