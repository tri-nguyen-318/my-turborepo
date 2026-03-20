import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly client: S3Client;
  private readonly bucket: string;

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

  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      console.log(`Bucket "${this.bucket}" exists.`);
      await this.setBucketPolicy(this.bucket);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          console.log(`Bucket "${this.bucket}" created.`);
          await this.setBucketPolicy(this.bucket);
        } catch (e) {
          console.error(`Failed to create bucket "${this.bucket}":`, e);
        }
      } else {
        console.error(`Error checking bucket "${this.bucket}":`, error);
      }
    }
  }

  async initiate(filename: string, contentType: string) {
    const safeType = contentType || 'application/octet-stream';
    const folder = safeType.startsWith('image/') ? 'images/' : 'video-uploads/';
    const key = `${folder}${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
    const res = await this.client.send(
      new CreateMultipartUploadCommand({ Bucket: this.bucket, Key: key, ContentType: safeType }),
    );
    return { uploadId: res.UploadId as string, key };
  }

  async getSignedUrl(key: string, uploadId: string, partNumber: number) {
    const signedUrl = await getSignedUrl(
      this.client,
      new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: 300 },
    );
    return { signedUrl };
  }

  async complete(key: string, uploadId: string, parts: { PartNumber: number; ETag: string }[]) {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
      }),
    );
    return {
      location: `${process.env.S3_ENDPOINT}/${this.bucket}/${key}`,
      bucket: this.bucket,
      key,
    };
  }

  async abort(key: string, uploadId: string) {
    await this.client.send(
      new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId }),
    );
    return { ok: true };
  }

  private async setBucketPolicy(bucketName: string) {
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await this.client.send(
        new PutBucketPolicyCommand({ Bucket: bucketName, Policy: JSON.stringify(policy) }),
      );
    } catch (e) {
      console.error(`Failed to set bucket policy for "${bucketName}":`, e);
    }
  }
}
