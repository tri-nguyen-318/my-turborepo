import { apiSlice } from './baseApi';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

const adminApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listAdminUsers: builder.query<AdminUser[], void>({
      query: () => '/api/admin/users',
      providesTags: ['AdminUsers'],
    }),
    setUserRole: builder.mutation<AdminUser, { id: number; role: 'USER' | 'ADMIN' }>({
      query: ({ id, role }) => ({
        url: `/api/admin/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
  }),
});

export const { useListAdminUsersQuery, useSetUserRoleMutation } = adminApi;
