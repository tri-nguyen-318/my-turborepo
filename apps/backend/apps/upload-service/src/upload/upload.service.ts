import { Injectable } from '@nestjs/common';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });
    this.bucket = process.env.S3_BUCKET || 'uploads';
  }

  async initiate(filename: string, contentType: string) {
    const folder = contentType.startsWith('image/') ? 'images/' : 'video-uploads/';
    const key = `${folder}${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
    const cmd = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const res = await this.client.send(cmd);
    return { uploadId: res.UploadId as string, key };
  }

  async getSignedUrl(key: string, uploadId: string, partNumber: number) {
    const cmd = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });
    const signedUrl = await getSignedUrl(this.client, cmd, { expiresIn: 60 * 5 });
    return { signedUrl };
  }

  async complete(key: string, uploadId: string, parts: { PartNumber: number; ETag: string }[]) {
    const cmd = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
    });
    const res = await this.client.send(cmd);
    return {
      location: res.Location as string,
      bucket: this.bucket,
      key,
      etag: res.ETag as string,
    };
  }

  async abort(key: string, uploadId: string) {
    const cmd = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    });
    await this.client.send(cmd);
    return { ok: true };
  }
}
