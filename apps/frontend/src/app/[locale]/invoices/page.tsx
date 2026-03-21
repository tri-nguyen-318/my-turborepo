'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useListInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRequestPaymentMutation,
  usePayInvoiceMutation,
  useCreatePaypalOrderMutation,
  useCapturePaypalOrderMutation,
  downloadInvoicesCsv,
} from '@/store/api';
import type { Invoice, CreateInvoiceInput } from '@/store/api';
import type { RootState } from '@/store/store';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceFormDialog } from './components/InvoiceFormDialog';
import { DeleteInvoiceDialog } from './components/DeleteInvoiceDialog';
import { PaymentDialog } from './components/PaymentDialog';

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const t = useTranslations('invoicesDemo');
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const idFilter = search.trim() ? parseInt(search.trim()) : undefined;

  const { data, isLoading } = useListInvoicesQuery(
    { page, pageSize: PAGE_SIZE, id: idFilter },
    { skip: !accessToken },
  );

  const invoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const [createInvoice] = useCreateInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [requestPayment] = useRequestPaymentMutation();
  const [payInvoice] = usePayInvoiceMutation();
  const [createPaypalOrder] = useCreatePaypalOrderMutation();
  const [capturePaypalOrder] = useCapturePaypalOrderMutation();

  const handleFormSubmit = async (payload: CreateInvoiceInput, id?: number) => {
    if (id) {
      await updateInvoice({ id, ...payload });
    } else {
      await createInvoice(payload);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    await deleteInvoice(deleteId);
    setDeleteId(null);
  };

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background p-8">
      <div className="w-full max-w-5xl flex-1 rounded-xl bg-card p-8 shadow-xl">
        <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1"
            type="number"
            min={1}
          />
          <Button variant="secondary" onClick={() => downloadInvoicesCsv(accessToken!)}>
            {t('exportCsv')}
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('addInvoice')}
          </Button>
        </div>

        <InvoiceTable
          invoices={invoices}
          isLoading={isLoading}
          onEdit={inv => {
            setEditing(inv);
            setFormOpen(true);
          }}
          onDelete={setDeleteId}
          onPay={setPaymentInvoice}
        />

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                label={t('paginationPrevious')}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              const near = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              if (!near) {
                const isEllipsis = p === 2 || p === totalPages - 1;
                return isEllipsis ? (
                  <PaginationItem key={p}>
                    <PaginationEllipsis label={t('paginationMorePages')} />
                  </PaginationItem>
                ) : null;
              }
              return (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                label={t('paginationNext')}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <InvoiceFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteInvoiceDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <PaymentDialog
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onRequestPayment={id => requestPayment(id).unwrap()}
        onPay={(id, token) => payInvoice({ id, token }).unwrap()}
        onCreatePaypalOrder={id => createPaypalOrder(id).unwrap()}
        onCapturePaypalOrder={(id, orderId) => capturePaypalOrder({ id, orderId }).unwrap()}
      />
    </div>
  );
}
