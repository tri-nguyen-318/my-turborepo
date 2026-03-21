import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../shared/database/prisma.module';
import { EmailModule } from '../email/email.module';
import { InvoiceService } from './application/invoice.service';
import { InvoiceController } from './presentation/invoice.controller';

@Module({
  imports: [PrismaModule, EmailModule, ConfigModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
