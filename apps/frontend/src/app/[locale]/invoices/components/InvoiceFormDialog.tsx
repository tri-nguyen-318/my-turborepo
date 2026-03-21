'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Invoice, CreateInvoiceInput } from '@/store/api';

type FormValues = {
  customer: string;
  customerEmail: string;
  amount: string;
  date: string;
  notes: string;
};

interface Props {
  open: boolean;
  editing: Invoice | null;
  onClose: () => void;
  onSubmit: (payload: CreateInvoiceInput, id?: number) => Promise<void>;
}

export function InvoiceFormDialog({ open, editing, onClose, onSubmit }: Props) {
  const t = useTranslations('invoicesDemo');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { customer: '', customerEmail: '', amount: '', date: '', notes: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({
        customer: editing.customer,
        customerEmail: editing.customerEmail,
        amount: String(editing.amount),
        date: editing.date.slice(0, 10),
        notes: editing.notes ?? '',
      });
    } else {
      reset({ customer: '', customerEmail: '', amount: '', date: '', notes: '' });
    }
  }, [editing, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    const payload: CreateInvoiceInput = {
      customer: data.customer,
      customerEmail: data.customerEmail,
      amount: Number(data.amount),
      date: data.date,
      notes: data.notes || undefined,
    };
    await onSubmit(payload, editing?.id);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t('editInvoice') : t('addInvoice')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium">{t('customer')}</label>
            <Input {...register('customer', { required: true })} placeholder={t('customer')} />
            {errors.customer && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">{t('customerEmail')}</label>
            <Input
              {...register('customerEmail', { required: true })}
              type="email"
              placeholder={t('customerEmail')}
            />
            {errors.customerEmail && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">{t('amount')}</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                {...register('amount', { required: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
              />
            </div>
            {errors.amount && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">{t('date')}</label>
            <Controller
              name="date"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={date => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                  placeholder={t('date')}
                />
              )}
            />
            {errors.date && <span className="text-xs text-red-500">{t('required')}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">{t('notes')}</label>
            <Textarea {...register('notes')} placeholder={t('notes')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? t('save') : t('add')}
            </Button>
            <Button variant="ghost" type="button" onClick={onClose}>
              {t('cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
