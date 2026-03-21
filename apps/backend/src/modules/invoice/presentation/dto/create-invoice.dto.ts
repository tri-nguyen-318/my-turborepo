import { IsString, IsEmail, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  customer: string;

  @IsEmail()
  customerEmail: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
