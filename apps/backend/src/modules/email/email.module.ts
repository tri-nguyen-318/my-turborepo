import { Module } from '@nestjs/common';
import { EmailService } from './application/email.service';
import { EmailController } from './presentation/email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
