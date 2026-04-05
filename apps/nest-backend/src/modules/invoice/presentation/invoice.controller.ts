import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { InvoiceService } from '../application/invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@Controller('api/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  list(@Query('page') page = '1', @Query('pageSize') pageSize = '10', @Query('id') id?: string) {
    return this.invoiceService.list({
      page: Math.max(1, parseInt(page)),
      pageSize: Math.min(100, Math.max(1, parseInt(pageSize))),
      id: id ? parseInt(id) : undefined,
    });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.delete(id);
  }

  @Post(':id/request-payment')
  @UseGuards(AuthGuard('jwt'))
  requestPayment(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.requestPayment(id);
  }

  @Post(':id/verify-token')
  verifyToken(@Param('id', ParseIntPipe) id: number, @Body() dto: PayInvoiceDto) {
    return this.invoiceService.verifyToken(id, dto.token);
  }

  @Post(':id/paypal/create-order')
  @UseGuards(AuthGuard('jwt'))
  createPaypalOrder(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.createPaypalOrder(id);
  }

  @Post(':id/paypal/capture-order')
  capturePaypalOrder(@Param('id', ParseIntPipe) id: number, @Body('orderId') orderId: string) {
    return this.invoiceService.capturePaypalOrder(id, orderId);
  }

  @Get('export/csv')
  @UseGuards(AuthGuard('jwt'))
  async exportCsv(@Res() res: Response) {
    const invoices = await this.invoiceService.getCsvData();

    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = [
      ['ID', 'Customer', 'Email', 'Amount', 'Date', 'Status', 'Notes'].map(escape).join(','),
      ...invoices.map(inv =>
        [
          inv.id,
          inv.customer,
          inv.customerEmail,
          inv.amount,
          inv.date.toISOString().slice(0, 10),
          inv.status,
          inv.notes ?? '',
        ]
          .map(escape)
          .join(','),
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    res.send(rows);
  }
}
