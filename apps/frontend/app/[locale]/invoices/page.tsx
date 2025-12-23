'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Invoice {
  id: number;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

const initialInvoices: Invoice[] = [
  { id: 1, customer: 'Alice', amount: 120, date: '2023-12-01', status: 'Paid' },
  { id: 2, customer: 'Bob', amount: 200, date: '2023-12-05', status: 'Unpaid' },
  { id: 3, customer: 'Charlie', amount: 150, date: '2023-12-10', status: 'Paid' },
];

export default function InvoicesPage() {
  const t = useTranslations('invoicesDemo');
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ customer: '', amount: '', date: '', status: 'Paid' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(
      inv =>
        inv.customer.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q) ||
        inv.date.includes(q) ||
        String(inv.amount).includes(q),
    );
  }, [search, invoices]);

  const handleEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({
      customer: inv.customer,
      amount: String(inv.amount),
      date: inv.date,
      status: inv.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const handleSave = () => {
    if (!form.customer || !form.amount || !form.date) return;
    if (editing) {
      setInvoices(
        invoices.map(inv =>
          inv.id === editing.id ? { ...editing, ...form, amount: Number(form.amount) } : inv,
        ),
      );
      setEditing(null);
    } else {
      setInvoices([
        ...invoices,
        {
          id: Date.now(),
          customer: form.customer,
          amount: Number(form.amount),
          date: form.date,
          status: form.status,
        },
      ]);
    }
    setForm({ customer: '', amount: '', date: '', status: 'Paid' });
    setDialogOpen(false);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Customer', 'Amount', 'Date', 'Status'],
      ...invoices.map(inv => [inv.id, inv.customer, inv.amount, inv.date, inv.status]),
    ]
      .map(row => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-background p-8">
      <div className="w-full max-w-4xl bg-card rounded-xl shadow-xl p-8 flex-1">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleExport} variant="secondary">
            {t('exportCsv')}
          </Button>
        </div>
        <div className="flex justify-end mb-2">
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ customer: '', amount: '', date: '', status: 'Paid' });
              setDialogOpen(true);
            }}
          >
            {t('addInvoice')}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customer')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(inv => (
              <TableRow key={inv.id}>
                <TableCell>{inv.customer}</TableCell>
                <TableCell>${inv.amount}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>{inv.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}>
                      {t('edit')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}>
                      {t('delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
          open={dialogOpen}
          onOpenChange={open => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? t('editInvoice') : t('addInvoice')}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                placeholder={t('customer')}
                value={form.customer}
                onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
              />
              <Input
                placeholder={t('amount')}
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
              <Input
                placeholder={t('date') + ' (YYYY-MM-DD)'}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">{t('status') + ': ' + t('paid')}</SelectItem>
                  <SelectItem value="Unpaid">{t('status') + ': ' + t('unpaid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>{editing ? t('save') : t('add')}</Button>
              <DialogClose asChild>
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}>
                  {t('cancel')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
