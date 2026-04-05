'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { Invoice } from '@/store/api';

interface Props {
  invoices: Invoice[];
  isLoading: boolean;
  onEdit: (inv: Invoice) => void;
  onDelete: (id: number) => void;
  onPay: (inv: Invoice) => void;
}

export function InvoiceTable({ invoices, isLoading, onEdit, onDelete, onPay }: Props) {
  const t = useTranslations('invoicesDemo');

  if (isLoading) {
    return <p className="py-8 text-center text-muted-foreground">{t('loading')}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>{t('customer')}</TableHead>
          <TableHead>{t('amount')}</TableHead>
          <TableHead>{t('date')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono text-xs text-muted-foreground">
              #{String(inv.id).padStart(6, '0')}
            </TableCell>
            <TableCell>
              <div className="font-medium">{inv.customer}</div>
              <div className="text-xs text-muted-foreground">{inv.customerEmail}</div>
            </TableCell>
            <TableCell>${inv.amount.toFixed(2)}</TableCell>
            <TableCell>{inv.date.slice(0, 10)}</TableCell>
            <TableCell>
              <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>
                {inv.status === 'PAID' ? t('paid') : t('unpaid')}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(inv)}>
                  {t('edit')}
                </Button>
                {inv.status === 'UNPAID' && (
                  <Button size="sm" variant="outline" onClick={() => onPay(inv)}>
                    {t('pay')}
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => onDelete(inv.id)}>
                  {t('delete')}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
