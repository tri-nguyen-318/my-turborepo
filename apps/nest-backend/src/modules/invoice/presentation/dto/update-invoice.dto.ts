import { IsString, IsEmail, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
