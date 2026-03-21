import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface MailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service configured with Resend');
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged to console');
    }
  }

  async sendMail(options: MailOptions): Promise<{ messageId: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    if (!this.resend) {
      this.logger.log(
        `[EMAIL-FALLBACK] To: ${toArray.join(', ')} | Subject: ${options.subject} | Body: ${options.text}`,
      );
      return { messageId: `console-${Date.now()}` };
    }

    const { data, error } = await this.resend.emails.send({
      from: this.config.get<string>('RESEND_FROM') ?? 'onboarding@resend.dev',
      to: toArray,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to send email');
    }

    return { messageId: data.id };
  }
}
