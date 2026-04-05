import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const goBackendApi = createApi({
  reducerPath: 'goBackendApi',
  tagTypes: ['Books'],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8080',
  }),
  endpoints: () => ({}),
});
