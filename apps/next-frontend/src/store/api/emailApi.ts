import { apiSlice } from './baseApi';

export interface SendEmailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

const emailApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    sendEmail: builder.mutation<SendEmailResponse, SendEmailRequest>({
      query: body => ({ url: '/api/email/send', method: 'POST', body }),
    }),
  }),
});

export const { useSendEmailMutation } = emailApi;
