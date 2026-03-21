import { apiSlice } from './baseApi';

export interface Invoice {
  id: number;
  customer: string;
  customerEmail: string;
  amount: number;
  date: string;
  status: 'PAID' | 'UNPAID';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  customer: string;
  customerEmail: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface UpdateInvoiceInput {
  id: number;
  customer?: string;
  customerEmail?: string;
  amount?: number;
  date?: string;
  notes?: string;
}

const invoiceApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listInvoices: builder.query<
      { data: Invoice[]; total: number; page: number; pageSize: number; totalPages: number },
      { page?: number; pageSize?: number; id?: number }
    >({
      query: ({ page = 1, pageSize = 10, id } = {}) => ({
        url: '/api/invoices',
        params: { page, pageSize, ...(id !== undefined && { id }) },
      }),
      providesTags: ['Invoices'],
    }),
    createInvoice: builder.mutation<Invoice, CreateInvoiceInput>({
      query: body => ({ url: '/api/invoices', method: 'POST', body }),
      invalidatesTags: ['Invoices'],
    }),
    updateInvoice: builder.mutation<Invoice, UpdateInvoiceInput>({
      query: ({ id, ...body }) => ({ url: `/api/invoices/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Invoices'],
    }),
    deleteInvoice: builder.mutation<{ ok: boolean }, number>({
      query: id => ({ url: `/api/invoices/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Invoices'],
    }),
    requestPayment: builder.mutation<{ ok: boolean }, number>({
      query: id => ({ url: `/api/invoices/${id}/request-payment`, method: 'POST' }),
      invalidatesTags: ['Invoices'],
    }),
    payInvoice: builder.mutation<Invoice, { id: number; token: string }>({
      query: ({ id, token }) => ({
        url: `/api/invoices/${id}/pay`,
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['Invoices'],
    }),
    createPaypalOrder: builder.mutation<{ orderId: string }, number>({
      query: id => ({ url: `/api/invoices/${id}/paypal/create-order`, method: 'POST' }),
    }),
    capturePaypalOrder: builder.mutation<Invoice, { id: number; orderId: string }>({
      query: ({ id, orderId }) => ({
        url: `/api/invoices/${id}/paypal/capture-order`,
        method: 'POST',
        body: { orderId },
      }),
      invalidatesTags: ['Invoices'],
    }),
  }),
});

export const {
  useListInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRequestPaymentMutation,
  usePayInvoiceMutation,
  useCreatePaypalOrderMutation,
  useCapturePaypalOrderMutation,
} = invoiceApi;

export const downloadInvoicesCsv = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/export/csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invoices.csv';
  a.click();
  URL.revokeObjectURL(url);
};
