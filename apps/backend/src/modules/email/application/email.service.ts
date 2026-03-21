import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface MailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private fromAddress = 'noreply@demo.com';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.fromAddress = user;
      this.transporter = nodemailer.createTransport({
        host,
        port: port ?? 587,
        secure: (port ?? 587) === 465,
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log('Email service configured with SMTP');
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console');
    }
  }

  async sendMail(options: MailOptions): Promise<{ messageId: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(
        `[EMAIL-FALLBACK] To: ${toArray.join(', ')} | Subject: ${options.subject} | Body: ${options.text}`,
      );
      return { messageId: `console-${Date.now()}` };
    }

    const info = await this.transporter.sendMail({
      from: this.fromAddress,
      to: toArray.join(', '),
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { messageId: info.messageId };
  }
}
