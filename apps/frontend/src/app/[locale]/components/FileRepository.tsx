'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, FileVideo, FileImage, File, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useListUploadedFilesQuery, useDeleteUploadedFileMutation } from '@/store/api';
import type { UploadedFile } from '@/store/api';

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <FileVideo className="h-8 w-8 text-blue-400" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return <FileImage className="h-8 w-8 text-emerald-400" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

function FilePreview({ file }: { file: UploadedFile }) {
  const ext = file.filename.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return (
      <video
        src={file.location}
        controls
        className="w-full rounded-lg object-contain"
        style={{ maxHeight: 200 }}
      />
    );
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return (
      <img
        src={file.location}
        alt={file.filename}
        className="max-h-48 w-full rounded-lg object-contain"
      />
    );
  }
  return null;
}

function FileCard({ file, onDelete }: { file: UploadedFile; onDelete: (id: number) => void }) {
  const t = useTranslations('repository');
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(file.location);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-md">
        <FilePreview file={file} />

        <div className="flex items-start gap-3">
          <FileIcon filename={file.filename} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={file.filename}>
              {file.filename}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(file.createdAt).toLocaleDateString()}
              {file.uploader && (
                <span className="ml-1">· {file.uploader.name ?? file.uploader.email}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 flex-1 px-2 text-xs" onClick={copyUrl}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? t('copied') : t('copyUrl')}
          </Button>
          {file.canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => setDeleteOpen(true)}
              title={t('delete')}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteModalTitle')}</DialogTitle>
            <DialogDescription>
              {t('deleteModalDesc', { filename: file.filename })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('deleteModalCancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(file.id);
                setDeleteOpen(false);
              }}
            >
              {t('deleteModalConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FileRepository() {
  const t = useTranslations('repository');
  const { data: files = [], isLoading } = useListUploadedFilesQuery();
  const [deleteFile] = useDeleteUploadedFileMutation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
        <File className="h-10 w-10 opacity-30" />
        <p className="text-sm">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map(file => (
        <FileCard key={file.id} file={file} onDelete={id => deleteFile(id)} />
      ))}
    </div>
  );
}
