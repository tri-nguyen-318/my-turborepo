import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './authSlice';
import { authApiSlice } from '@/store/api/authApi';
import { apiSlice } from '@/store/api';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(authApiSlice.middleware, apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
