import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className, size = 48 }: { className?: string; size?: number }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 
          className={`animate-spin text-primary ${className}`} 
          size={size} 
        />
      </div>
      <p className="text-muted-foreground animate-pulse font-medium tracking-wide">
        Loading...
      </p>
    </div>
  );
};
