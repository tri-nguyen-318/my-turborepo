import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/database/prisma.service';
import { EmailService } from '../../email/application/email.service';
import { emailTemplates } from '../../email/application/email.templates';
import { CreateInvoiceDto } from '../presentation/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../presentation/dto/update-invoice.dto';

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  private async getPaypalAccessToken(): Promise<string> {
    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.config.get<string>('PAYPAL_SECRET');
    const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  async createPaypalOrder(id: number): Promise<{ orderId: string }> {
    const invoice = await this.findOrThrow(id);
    if (invoice.status === 'PAID') throw new BadRequestException('Invoice is already paid');
    const token = await this.getPaypalAccessToken();
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: String(id),
            amount: { currency_code: 'USD', value: invoice.amount.toFixed(2) },
          },
        ],
      }),
    });
    const data = (await res.json()) as {
      id?: string;
      message?: string;
      error_description?: string;
    };
    if (!res.ok || !data.id) {
      throw new BadRequestException(
        data.message ?? data.error_description ?? 'Failed to create PayPal order',
      );
    }
    return { orderId: data.id };
  }

  async capturePaypalOrder(id: number, orderId: string) {
    const invoice = await this.findOrThrow(id);
    if (invoice.status === 'PAID') throw new BadRequestException('Invoice is already paid');
    const token = await this.getPaypalAccessToken();
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = (await res.json()) as { status?: string; message?: string };
    if (!res.ok || data.status !== 'COMPLETED') {
      throw new BadRequestException(data.message ?? 'PayPal payment not completed');
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paymentToken: null, paymentTokenExp: null },
    });
    await this.emailService.sendMail({
      to: invoice.customerEmail,
      ...emailTemplates.paymentConfirmed(invoice),
    });
    return updated;
  }

  async list(params: { page: number; pageSize: number; id?: number }) {
    const { page, pageSize, id } = params;
    const where = id !== undefined ? { id } : {};
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        customer: dto.customer,
        customerEmail: dto.customerEmail,
        amount: dto.amount,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    await this.findOrThrow(id);
    const { date, ...rest } = dto;
    return this.prisma.invoice.update({
      where: { id },
      data: { ...rest, ...(date !== undefined && { date: new Date(date) }) },
    });
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await this.prisma.invoice.delete({ where: { id } });
    return { ok: true };
  }

  async requestPayment(id: number) {
    const invoice = await this.findOrThrow(id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    const exp = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.invoice.update({
      where: { id },
      data: { paymentToken: token, paymentTokenExp: exp },
    });

    await this.emailService.sendMail({
      to: invoice.customerEmail,
      ...emailTemplates.paymentRequest({ ...invoice, token }),
    });

    return { ok: true };
  }

  async verifyToken(id: number, token: string) {
    const invoice = await this.findOrThrow(id);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    if (
      !invoice.paymentToken ||
      !invoice.paymentTokenExp ||
      invoice.paymentToken !== token ||
      invoice.paymentTokenExp < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { ok: true };
  }

  getCsvData() {
    return this.prisma.invoice.findMany({ orderBy: { date: 'desc' } });
  }

  private async findOrThrow(id: number) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
    return invoice;
  }
}
