import { fetchJson } from '../fetchJson';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SendEmailRequest {
  to: string;
  subject: string;
  text: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

export const emailApi = {
  sendEmail: async (data: SendEmailRequest): Promise<SendEmailResponse> => {
    return fetchJson<SendEmailResponse>(`${API_URL}/api/email/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
