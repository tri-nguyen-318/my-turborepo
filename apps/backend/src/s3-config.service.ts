import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class S3ConfigService {
  private readonly logger = new Logger(S3ConfigService.name);

  constructor(private configService: ConfigService) {}

  createS3Client(): S3Client {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') ?? 'localhost';
    const port = this.configService.get<string>('MINIO_PORT') ?? '9000';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') ?? '';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') ?? '';

    this.logger.log(`🔧 Configuring S3Client for MinIO:`);
    this.logger.log(`  Endpoint: http://${endpoint}:${port}`);
    this.logger.log(`  Access Key: ${accessKey ? accessKey.substring(0, 3) + '***' : '(empty)'}`);
    this.logger.log(`  Secret Key: ${secretKey ? '***' : '(empty)'}`);

    return new S3Client({
      endpoint: `http://${endpoint}:${port}`,
      region: 'us-east-1', // MinIO doesn't require a real region, but SDK needs one
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  getBucketName(): string {
    const bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') ?? 'video-uploads';
    this.logger.log(`📦 Using bucket: ${bucketName}`);
    return bucketName;
  }
}
