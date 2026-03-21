import { Injectable, OnModuleInit, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../../shared/database/prisma.service';

const OWNER_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly prisma: PrismaService) {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'auto',
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
    } catch (error: unknown) {
      const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          console.log(`Bucket "${this.bucket}" created.`);
        } catch (e) {
          console.error(`Failed to create bucket "${this.bucket}":`, e);
        }
      } else {
        console.error(`Error checking bucket "${this.bucket}":`, error);
      }
    }

    await this.setBucketCors(this.bucket);
  }

  private async setBucketCors(bucketName: string) {
    const frontendUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
    const allowedOrigins = [frontendUrl, frontendUrl.replace('://', '://www.')].filter(Boolean);

    try {
      await this.client.send(
        new PutBucketCorsCommand({
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: allowedOrigins,
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedHeaders: ['*'],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3000,
              },
            ],
          },
        }),
      );
      console.log(`CORS configured for bucket "${bucketName}".`);
    } catch (e) {
      console.error(`Failed to set CORS for "${bucketName}":`, e);
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

  async complete(
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
    userId?: number,
  ) {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
      }),
    );

    const location = `${process.env.S3_ENDPOINT}/${this.bucket}/${key}`;
    const filename = key.split('/').pop()?.split('-').slice(2).join('-') ?? key;

    await this.prisma.uploadedFile.create({
      data: { key, location, filename, userId: userId ?? null },
    });

    return { location, bucket: this.bucket, key };
  }

  async abort(key: string, uploadId: string) {
    await this.client.send(
      new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId }),
    );
    return { ok: true };
  }

  async listFiles(requestingUserId?: number, requestingEmail?: string) {
    const files = await this.prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });

    return files.map(f => ({
      id: f.id,
      key: f.key,
      location: f.location,
      filename: f.filename,
      createdAt: f.createdAt,
      uploader: f.user ? { email: f.user.email, name: f.user.name } : null,
      canDelete:
        requestingEmail === OWNER_EMAIL || (!!requestingUserId && f.userId === requestingUserId),
    }));
  }

  async deleteFile(id: number, requestingUserId?: number, requestingEmail?: string) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    const isOwner = requestingEmail === OWNER_EMAIL;
    const isUploader = !!requestingUserId && file.userId === requestingUserId;

    if (!isOwner && !isUploader) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: file.key }));
    await this.prisma.uploadedFile.delete({ where: { id } });

    return { ok: true };
  }
}
