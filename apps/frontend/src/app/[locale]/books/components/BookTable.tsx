'use client';

import { useTranslations } from 'next-intl';
import { Book } from '@/store/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BookTableProps {
  books: Book[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function BookTable({ books, onEdit, onDelete }: BookTableProps) {
  const t = useTranslations('booksDemo');

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title_field')}</TableHead>
            <TableHead>{t('author_field')}</TableHead>
            <TableHead className="w-20">{t('year_field')}</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map(book => (
            <TableRow key={book.id}>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.year}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(book.id)}>
                    {t('edit')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(book.id)}>
                    {t('delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
