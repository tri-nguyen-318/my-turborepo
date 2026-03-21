import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../../shared/database/prisma.service';

const OWNER_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly client: S3Client;
  private readonly publicBucket: string;
  private readonly privateBucket: string;

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
    this.publicBucket = process.env.S3_PUBLIC_BUCKET || 'public-uploads';
    this.privateBucket = process.env.S3_PRIVATE_BUCKET || 'private-uploads';
  }

  async onModuleInit() {
    await this.ensureBucket(this.publicBucket);
    await this.ensureBucket(this.privateBucket);
    await this.setBucketCors(this.publicBucket);
    await this.setBucketCors(this.privateBucket);
  }

  private async ensureBucket(bucketName: string) {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket "${bucketName}" exists.`);
    } catch (error: unknown) {
      const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: bucketName }));
          console.log(`Bucket "${bucketName}" created.`);
        } catch (e) {
          console.error(`Failed to create bucket "${bucketName}":`, e);
        }
      } else {
        console.error(`Error checking bucket "${bucketName}":`, error);
      }
    }
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
    } catch (e: unknown) {
      const err = e as { name?: string; Code?: string };
      if (err.name === 'NotImplemented' || err.Code === 'NotImplemented') {
        console.warn(
          `PutBucketCors not supported for "${bucketName}" — configure CORS manually in your storage provider's console.`,
        );
      } else {
        console.error(`Failed to set CORS for "${bucketName}":`, e);
      }
    }
  }

  async initiate(filename: string, contentType: string, isPublic: boolean) {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    const safeType = contentType || 'application/octet-stream';
    const folder = safeType.startsWith('image/')
      ? 'images/'
      : safeType === 'application/pdf'
        ? 'documents/'
        : 'uploads/';
    const key = `${folder}${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
    const res = await this.client.send(
      new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: safeType }),
    );
    return { uploadId: res.UploadId as string, key, bucket };
  }

  async getSignedUrl(bucket: string, key: string, uploadId: string, partNumber: number) {
    const signedUrl = await getSignedUrl(
      this.client,
      new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: 300 },
    );
    return { signedUrl };
  }

  async complete(
    bucket: string,
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
    isPublic: boolean,
    userId?: number,
  ) {
    if (!isPublic && !userId) {
      throw new UnauthorizedException('You must be logged in to upload private files');
    }

    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
      }),
    );

    if (!isPublic) {
      const rawLocation = `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
      const filename = key.split('/').pop()?.split('-').slice(2).join('-') ?? key;
      await this.prisma.uploadedFile.create({
        data: { key, location: rawLocation, filename, userId: userId ?? null },
      });
      // Return a presigned GET URL so the uploader can immediately preview/link the file
      const presignedLocation = await this.getPresignedGetUrl(bucket, key);
      return { location: presignedLocation, bucket, key };
    }

    // Public files: use the public-facing URL (pub-*.r2.dev or MinIO public URL)
    const publicBase = (
      process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${bucket}`
    ).replace(/\/$/, '');
    return { location: `${publicBase}/${key}`, bucket, key };
  }

  async abort(bucket: string, key: string, uploadId: string) {
    await this.client.send(
      new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }),
    );
    return { ok: true };
  }

  async listFiles(requestingUserId?: number, requestingEmail?: string) {
    if (!requestingUserId) return [];

    const where = requestingEmail === OWNER_EMAIL ? {} : { userId: requestingUserId };

    const files = await this.prisma.uploadedFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });

    return Promise.all(
      files.map(async f => ({
        id: f.id,
        key: f.key,
        location: await this.getPresignedGetUrl(this.privateBucket, f.key),
        filename: f.filename,
        createdAt: f.createdAt,
        uploader: f.user ? { email: f.user.email, name: f.user.name } : null,
        canDelete:
          requestingEmail === OWNER_EMAIL || (!!requestingUserId && f.userId === requestingUserId),
      })),
    );
  }

  private async getPresignedGetUrl(bucket: string, key: string): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: 3600,
    });
  }

  async deleteFile(id: number, requestingUserId?: number, requestingEmail?: string) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    const isOwner = requestingEmail === OWNER_EMAIL;
    const isUploader = !!requestingUserId && file.userId === requestingUserId;

    if (!isOwner && !isUploader) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    await this.client.send(new DeleteObjectCommand({ Bucket: this.privateBucket, Key: file.key }));
    await this.prisma.uploadedFile.delete({ where: { id } });

    return { ok: true };
  }
}
