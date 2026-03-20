import { Module } from '@nestjs/common';
import { UploadController } from './presentation/upload.controller';
import { UploadService } from './application/upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
