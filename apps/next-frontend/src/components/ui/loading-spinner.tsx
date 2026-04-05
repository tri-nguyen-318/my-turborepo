import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className, size = 48 }: { className?: string; size?: number }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
        <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
      </div>
      <p className="animate-pulse font-medium tracking-wide text-muted-foreground">Loading...</p>
    </div>
  );
};
