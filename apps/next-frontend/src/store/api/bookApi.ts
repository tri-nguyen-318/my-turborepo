import { goBackendApi } from './goBackendApi';

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  year: number;
}

export interface UpdateBookInput {
  id: number;
  title: string;
  author: string;
  year: number;
}

export interface BooksResponse {
  data: Book[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const bookApi = goBackendApi.injectEndpoints({
  endpoints: builder => ({
    listBooks: builder.query<BooksResponse, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: '/api/books',
        params: { page, pageSize },
      }),
      providesTags: ['Books'],
    }),
    getBook: builder.query<Book, number>({
      query: id => `/api/books/${id}`,
      providesTags: (_, __, id) => [{ type: 'Books', id }],
    }),
    createBook: builder.mutation<Book, CreateBookInput>({
      query: body => ({
        url: '/api/books',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Books'],
    }),
    updateBook: builder.mutation<Book, UpdateBookInput>({
      query: ({ id, ...body }) => ({
        url: `/api/books/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Books'],
    }),
    deleteBook: builder.mutation<{ ok: boolean }, number>({
      query: id => ({
        url: `/api/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'],
    }),
  }),
});

export const {
  useListBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} = bookApi;

export const { endpoints } = bookApi;
