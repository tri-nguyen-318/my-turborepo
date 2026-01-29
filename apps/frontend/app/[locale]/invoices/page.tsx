'use client';
import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DatePickerDemo as DatePicker } from '@/components/ui/date-picker';

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
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, setValue, reset, watch, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { search: '', customer: '', amount: '', date: '', status: 'Paid' },
  });
  const search = watch('search');

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
    setValue('customer', inv.customer);
    setValue('amount', String(inv.amount));
    setValue('date', inv.date);
    setValue('status', inv.status);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const onSubmit = (data: any) => {
    if (!data.customer || !data.amount || !data.date) return;
    if (editing) {
      setInvoices(
        invoices.map(inv =>
          inv.id === editing.id ? { ...editing, ...data, amount: Number(data.amount) } : inv,
        ),
      );
      setEditing(null);
    } else {
      setInvoices([
        ...invoices,
        {
          id: Date.now(),
          customer: data.customer,
          amount: Number(data.amount),
          date: data.date,
          status: data.status,
        },
      ]);
    }
    reset({ search, customer: '', amount: '', date: '', status: 'Paid' });
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
        <form className="flex flex-col sm:flex-row gap-4 mb-4" onSubmit={e => e.preventDefault()}>
          <Input
            placeholder={t('searchPlaceholder')}
            {...register('search')}
            className="flex-1"
          />
          <Button type="button" onClick={handleExport} variant="secondary">
            {t('exportCsv')}
          </Button>
        </form>
        <div className="flex justify-end mb-2">
          <Button
            onClick={() => {
              setEditing(null);
              reset({ search, customer: '', amount: '', date: '', status: 'Paid' });
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="font-medium">{t('customer')}</label>
                <Input
                  placeholder={t('customer')}
                  {...register('customer', { required: true })}
                />
                {errors.customer && <span className="text-red-500 text-xs">{t('required')}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">{t('amount')}</label>
                <Input
                  placeholder={t('amount')}
                  type="number"
                  {...register('amount', { required: true })}
                />
                {errors.amount && <span className="text-red-500 text-xs">{t('required')}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">{t('date')}</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={date => field.onChange(date ? date.toISOString().slice(0, 10) : "")}
                      placeholder={t('date') + ' (YYYY-MM-DD)'}
                    />
                  )}
                />
                {errors.date && <span className="text-red-500 text-xs">{t('required')}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">{t('status')}</label>
                <Select
                  value={watch('status')}
                  onValueChange={val => setValue('status', val)}
                >
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">{t('paid')}</SelectItem>
                    <SelectItem value="Unpaid">{t('unpaid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-2">
                <Button type="submit" disabled={isSubmitting}>{editing ? t('save') : t('add')}</Button>
                <DialogClose asChild>
                  <Button variant="ghost" type="button" onClick={() => setEditing(null)}>
                    {t('cancel')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
