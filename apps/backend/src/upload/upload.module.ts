import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { S3ConfigService } from '../s3-config.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, S3ConfigService],
})
export class UploadModule {}
