import { Injectable, Logger } from '@nestjs/common';
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3ConfigService } from '../s3-config.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private s3ConfigService: S3ConfigService) {
    this.s3Client = this.s3ConfigService.createS3Client();
    this.bucketName = this.s3ConfigService.getBucketName();
    void this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      this.logger.log(`🔍 Checking if bucket ${this.bucketName} exists...`);
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`✅ Bucket ${this.bucketName} exists`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NotFound') {
        this.logger.log(`📦 Creating bucket ${this.bucketName}...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`✅ Bucket ${this.bucketName} created successfully`);
      } else {
        this.logger.error('❌ Error checking bucket existence:', error);
      }
    }
  }

  async initiateMultipartUpload(filename: string, contentType: string) {
    const key = `uploads/${Date.now()}-${filename}`;
    this.logger.log(
      `🚀 [SERVICE] Initiating multipart upload for key: ${key}, contentType: ${contentType}`,
    );

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const response = await this.s3Client.send(command);
    this.logger.log(`✅ [SERVICE] Multipart upload initiated. UploadId: ${response.UploadId}`);

    return {
      uploadId: response.UploadId,
      key: response.Key,
    };
  }

  async getSignedUploadUrl(key: string, uploadId: string, partNumber: number) {
    this.logger.log(
      `🔗 [SERVICE] Generating signed URL for part ${partNumber}, key: ${key}, uploadId: ${uploadId}`,
    );
    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });
    this.logger.log(`✅ [SERVICE] Signed URL generated for part ${partNumber}`);

    return { signedUrl };
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ PartNumber: number; ETag: string }>,
  ) {
    this.logger.log(
      `🏁 [SERVICE] Completing multipart upload for key: ${key}, uploadId: ${uploadId}`,
    );
    this.logger.log(`Parts count: ${parts.length}, Parts: ${JSON.stringify(parts)}`);
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    const response = await this.s3Client.send(command);
    this.logger.log(`✅ [SERVICE] Multipart upload completed! Location: ${response.Location}`);

    return {
      location: response.Location,
      bucket: response.Bucket,
      key: response.Key,
      etag: response.ETag,
    };
  }

  async abortMultipartUpload(key: string, uploadId: string) {
    this.logger.log(
      `❌ [SERVICE] Aborting multipart upload for key: ${key}, uploadId: ${uploadId}`,
    );
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
    });

    await this.s3Client.send(command);
    this.logger.log(`✅ Upload aborted successfully`);

    return { message: 'Upload aborted successfully' };
  }
}
