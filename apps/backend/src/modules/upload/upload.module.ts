import { Module } from '@nestjs/common';
import { UploadController } from './presentation/upload.controller';
import { UploadService } from './application/upload.service';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
