'use client';

'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '../providers/AuthProvider';
import { authApi } from '@/lib/api/auth/authApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Mail, MapPin, Phone, Linkedin, Edit2, Check, X, Camera, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PersonalInfo } from '@/lib/api/info/infoApi';
import { Input } from '@/components/ui/input';
import { useGetInfo, useUpdateInfo } from '@/hooks/useInfo';
import { useForm } from 'react-hook-form';
import { AvatarUpload } from './AvatarUpload';
import { toast } from 'sonner';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { uploadApi } from '@/lib/api/upload/uploadApi';
import { CHUNK_SIZE } from '@/app/[locale]/components/video-uploader/config';
import type { UploadPart } from '@/app/[locale]/components/video-uploader/types';

interface EditableFieldProps {
  value: string | undefined;
  onSave: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  linkPrefix?: string;
  className?: string;
  multiline?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const EditableField = ({ value, onSave, icon, placeholder, linkPrefix, className, multiline, as: Component = 'span' }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');

  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  const handleSave = () => {
    if (currentValue !== value) {
      onSave(currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleSave(); // Only save on Enter if not multiline
    if (e.key === 'Escape') {
      setCurrentValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`flex ${multiline ? 'items-start' : 'items-center'} gap-2 w-full`}>
        {icon && <span className="text-muted-foreground mt-2">{icon}</span>}
        <div className="relative flex-1">
          {multiline ? (
            <Textarea
              autoFocus
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`min-h-[80px] text-sm ${className}`}
            />
          ) : (
            <Input
              autoFocus
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`text-sm py-6 ${className}`} 
            />
          )}
        </div>
      </div>
    );
  }

  if (!value && !isEditing) return (
    <div 
      className={`flex ${multiline ? 'items-start' : 'items-center'} gap-2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors py-1 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {icon}
      <span className="text-sm italic">Add {placeholder}...</span>
    </div>
  );

  return (
    <div 
      className={`flex ${multiline ? 'items-start' : 'items-center'} gap-2 group/field cursor-pointer hover:bg-muted/50 p-1 rounded -ml-1 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {linkPrefix ? (
        <a 
          href={`${linkPrefix}${value}`} 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-primary transition-colors truncate"
          onClick={(e) => e.stopPropagation()} // Prevent editing when clicking link
        >
          {value}
        </a>
      ) : (
        <Component>{value}</Component>
      )}
      <Edit2 className="h-3 w-3 opacity-0 group-hover/field:opacity-50 ml-2 flex-shrink-0" />
    </div>
  );
};

export const Hero = () => {
  const t = useTranslations('main');
  const { user, updateUser, accessToken } = useAuth();
  
  const { data: fetchedInfo } = useGetInfo();
  const updateInfoMutation = useUpdateInfo();

  const hasInfo = fetchedInfo && Object.keys(fetchedInfo).length > 0;

  const info: PersonalInfo = hasInfo ? fetchedInfo : {
    name: "User Name",
    role: "User Role",
    bio: "User Bio",
    location: "",
    phone: "",
    email: user?.email || "",
    github: "",
    linkedin: ""
  };

  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const fileCvInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const isAllowedToEdit = user?.email === 'nguyenhuutri31081999nht@gmail.com';
  
  const handleFieldUpdate = async (key: keyof PersonalInfo, value: string) => {
    try {
      // Send only the field that is being updated (Partial Update)
      const partialUpdate = { [key]: value };
      await updateInfoMutation.mutateAsync(partialUpdate);
    } catch (error) {
      console.error(`Failed to update ${key}`, error);
      toast.error(`Failed to update ${key}. Please try again.`);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      if (accessToken) {
        await authApi.updateProfile({ avatarUrl: url }, accessToken);
        updateUser({ avatarUrl: url });
        setShowAvatarUpload(false);
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      console.error('Failed to update avatar', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleCvUploadClick = () => {
    fileCvInputRef.current?.click();
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    setIsUploadingCv(true);
    try {
      const { uploadId, key } = await uploadApi.initiate(file.name, file.type, accessToken);
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: UploadPart[] = [];
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const { signedUrl } = await uploadApi.getSignedUrl(key, uploadId, partNumber, accessToken);
        const etag = await uploadApi.uploadChunk(signedUrl, chunk, file.type);
        parts.push({ ETag: etag, PartNumber: partNumber });
      }
      const result = await uploadApi.complete(key, uploadId, parts, accessToken);
      const publicUrl = result.location;
      await updateInfoMutation.mutateAsync({ cvUrl: publicUrl });
      toast.success('CV uploaded');
    } catch (err) {
      console.error('CV upload failed', err);
      toast.error('Failed to upload CV');
    } finally {
      setIsUploadingCv(false);
      if (fileCvInputRef.current) fileCvInputRef.current.value = '';
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/20 rounded-lg mb-8 relative group">
      <div className="container px-4 md:px-6">
        <div className="flex justify-end mb-4 gap-2">
          {fetchedInfo?.cvUrl && (
            <a href={fetchedInfo.cvUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download CV
              </Button>
            </a>
          )}
          {isAllowedToEdit && (
            <>
              <Button variant="default" className="gap-2" disabled={isUploadingCv} onClick={handleCvUploadClick}>
                <Upload className="h-4 w-4" /> {isUploadingCv ? 'Uploading...' : 'Upload CV'}
              </Button>
              <input
                ref={fileCvInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleCvFileChange}
              />
            </>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 w-full">
          {/* Avatar / Image */}
          <div className="flex-shrink-0 relative group/avatar">
            <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background shadow-xl">
              <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'User Avatar'} />
              <AvatarFallback className="text-4xl">{user?.name?.charAt(0) || 'T'}</AvatarFallback>
            </Avatar>
            
            {user && !showAvatarUpload && (
              <div 
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/90 transition-all z-10 opacity-0 group-hover/avatar:opacity-100 scale-90 group-hover/avatar:scale-100"
                onClick={() => setShowAvatarUpload(true)}
              >
                <Camera className="h-4 w-4" />
              </div>
            )}

            {showAvatarUpload && (
              <AvatarUpload 
                onUploadComplete={handleAvatarUpload}
                onCancel={() => setShowAvatarUpload(false)}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col w-full space-y-6 flex-1 min-w-0 items-start text-left">
            {/* Header: Name & Role */}
            <div className="space-y-0 w-full">
              <EditableField 
                value={info.name} 
                onSave={(val) => handleFieldUpdate('name', val)}
                placeholder="Name"
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                as="h1"
              />
              <EditableField 
                value={info.role} 
                onSave={(val) => handleFieldUpdate('role', val)}
                placeholder="Role (e.g. Software Engineer)"
                className="text-xl text-muted-foreground font-medium"
                as="p"
              />
            </div>

            {/* Bio */}
            <div className="max-w-[600px]">
               <EditableField 
                value={info.bio} 
                onSave={(val) => handleFieldUpdate('bio', val)}
                placeholder="Short bio about yourself..."
                className="md:text-lg"
                multiline
              />
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm w-full max-w-2xl">
              <EditableField 
                value={info.location} 
                onSave={(val) => handleFieldUpdate('location', val)}
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Location"
              />
              <EditableField 
                value={info.email} 
                onSave={(val) => handleFieldUpdate('email', val)}
                icon={<Mail className="h-4 w-4" />}
                placeholder="Email"
                linkPrefix="mailto:"
              />
              <EditableField 
                value={info.phone} 
                onSave={(val) => handleFieldUpdate('phone', val)}
                icon={<Phone className="h-4 w-4" />}
                placeholder="Phone"
              />
              <EditableField 
                value={info.github} 
                onSave={(val) => handleFieldUpdate('github', val)}
                icon={<Github className="h-4 w-4" />}
                placeholder="GitHub URL (e.g. github.com/username)"
                linkPrefix="https://"
              />
              <EditableField 
                value={info.linkedin} 
                onSave={(val) => handleFieldUpdate('linkedin', val)}
                icon={<Linkedin className="h-4 w-4" />}
                placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                linkPrefix="https://"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
