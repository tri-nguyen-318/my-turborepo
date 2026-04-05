'use client';

import { useTranslations } from 'next-intl';
import { useDeleteBookMutation } from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteBookDialogProps {
  bookId: number | null;
  onOpenChange: (id: number | null) => void;
}

export function DeleteBookDialog({ bookId, onOpenChange }: DeleteBookDialogProps) {
  const t = useTranslations('booksDemo');
  const [deleteBook, { isLoading }] = useDeleteBookMutation();

  const handleDelete = async () => {
    if (!bookId) return;

    try {
      await deleteBook(bookId).unwrap();
      onOpenChange(null);
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  return (
    <Dialog open={bookId !== null} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
        </DialogHeader>

        <p className="text-gray-600">{t('deleteConfirmDesc')}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
