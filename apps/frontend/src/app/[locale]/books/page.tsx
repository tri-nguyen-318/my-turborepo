'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useListBooksQuery } from '@/store/api';
import { BookTable } from './components/BookTable';
import { BookFormDialog } from './components/BookFormDialog';
import { DeleteBookDialog } from './components/DeleteBookDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BooksPage() {
  const t = useTranslations('booksDemo');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTitle, setSearchTitle] = useState('');

  const { data, isLoading } = useListBooksQuery({ page, pageSize });

  const books = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Client-side filtering
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTitle.toLowerCase()),
  );

  const handleCreateClick = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (id: number) => {
    setEditing(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>

        <div className="flex gap-4">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreateClick}>{t('addBook')}</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600">{t('loading')}</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center text-gray-600">{t('noBooks')}</div>
      ) : (
        <>
          <BookTable books={filteredBooks} onEdit={handleEditClick} onDelete={handleDeleteClick} />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {t('paginationPage', { page, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </>
      )}

      <BookFormDialog open={formOpen} onOpenChange={setFormOpen} bookId={editing} />

      <DeleteBookDialog bookId={deleteId} onOpenChange={setDeleteId} />
    </div>
  );
}
