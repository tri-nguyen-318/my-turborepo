import { IsString, Length } from 'class-validator';

export class PayInvoiceDto {
  @IsString()
  @Length(6, 6)
  token: string;
}
