'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  useCreateBookMutation,
  useUpdateBookMutation,
  useGetBookQuery,
  type CreateBookInput,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number | null;
}

export function BookFormDialog({ open, onOpenChange, bookId }: BookFormDialogProps) {
  const t = useTranslations('booksDemo');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: book } = useGetBookQuery(bookId!, { skip: !bookId });
  const [createBook] = useCreateBookMutation();
  const [updateBook] = useUpdateBookMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBookInput>({
    defaultValues: {
      title: '',
      author: '',
      year: new Date().getFullYear(),
    },
  });

  // Reset form when book data loads
  useEffect(() => {
    if (book && bookId) {
      reset({
        title: book.title,
        author: book.author,
        year: book.year,
      });
    }
  }, [book, bookId, reset]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !bookId) {
      reset({
        title: '',
        author: '',
        year: new Date().getFullYear(),
      });
      setError(null);
    }
  }, [open, bookId, reset]);

  const onSubmit = async (data: CreateBookInput) => {
    try {
      setIsLoading(true);
      setError(null);

      if (bookId && book) {
        await updateBook({
          id: bookId,
          ...data,
        }).unwrap();
      } else {
        await createBook(data).unwrap();
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{bookId ? t('editBookTitle') : t('addBookTitle')}</DialogTitle>
        </DialogHeader>

        {error && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title_field')}</Label>
            <Input
              id="title"
              placeholder={t('title_field')}
              {...register('title', { required: t('titleRequired') })}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">{t('author_field')}</Label>
            <Input
              id="author"
              placeholder={t('author_field')}
              {...register('author', { required: t('authorRequired') })}
            />
            {errors.author && <p className="text-sm text-red-600">{errors.author.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">{t('year_field')}</Label>
            <Input
              id="year"
              type="number"
              placeholder="2024"
              {...register('year', {
                required: t('yearRequired'),
                valueAsNumber: true,
              })}
            />
            {errors.year && <p className="text-sm text-red-600">{errors.year.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
