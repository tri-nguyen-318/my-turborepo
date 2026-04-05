'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from './AvatarUpload';

interface HeroAvatarProps {
  avatarUrl: string;
  name?: string;
  isAllowedToEdit: boolean;
  onAvatarUploaded: (url: string) => Promise<void>;
}

export const HeroAvatar = ({
  avatarUrl,
  name,
  isAllowedToEdit,
  onAvatarUploaded,
}: HeroAvatarProps) => {
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = async (url: string) => {
    await onAvatarUploaded(url);
    setShowUpload(false);
  };

  return (
    <div className="group/avatar relative flex-shrink-0">
      <Avatar className="h-32 w-32 border-4 border-background shadow-xl md:h-48 md:w-48">
        <AvatarImage src={avatarUrl} alt={name || 'Avatar'} />
        <AvatarFallback className="text-4xl">{name?.charAt(0) || 'T'}</AvatarFallback>
      </Avatar>

      {isAllowedToEdit && !showUpload && (
        <div
          className="absolute right-2 bottom-2 z-10 scale-90 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground opacity-0 shadow-lg transition-all group-hover/avatar:scale-100 group-hover/avatar:opacity-100 hover:bg-primary/90"
          onClick={() => setShowUpload(true)}
        >
          <Camera className="h-4 w-4" />
        </div>
      )}

      {showUpload && (
        <AvatarUpload
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};
