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

  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      console.log(`Bucket "${this.bucket}" exists.`);

      // Apply public read policy to existing bucket
      await this.setBucketPolicy(this.bucket);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`Bucket "${this.bucket}" not found. Creating...`);
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          console.log(`Bucket "${this.bucket}" created successfully.`);

          // Apply public read policy to new bucket
          await this.setBucketPolicy(this.bucket);
        } catch (createError) {
          console.error(`Failed to create bucket "${this.bucket}":`, createError);
        }
      } else {
        console.error(`Error checking bucket "${this.bucket}":`, error);
      }
    }
  }

  async setBucketPolicy(bucketName: string) {
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
        new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(policy),
        }),
      );
      console.log(`Bucket policy set to public read for "${bucketName}".`);
    } catch (error) {
      console.error(`Failed to set bucket policy for "${bucketName}":`, error);
    }
  }

  async initiate(filename: string, contentType: string) {
    console.log(contentType);
    // Default contentType to 'application/octet-stream' if undefined/null/empty
    const safeContentType = contentType || 'application/octet-stream';
    const folder = safeContentType.startsWith('image/') ? 'images/' : 'video-uploads/';
    const key = `${folder}${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
    const cmd = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: safeContentType,
      // ACL: 'public-read', // Not strictly needed if bucket policy is set, but good practice if supported
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

    // Construct a public-facing URL
    // Since res.Location might return the internal Docker network URL (e.g. http://minio:9000/...)
    // we need to return a URL that the browser can access (e.g. http://localhost:9000/...)

    // For local development with MinIO:
    const publicEndpoint = process.env.S3_ENDPOINT;
    const location = `${publicEndpoint}/${this.bucket}/${key}`;

    return {
      location: location,
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
