import { Controller, Post, Body, Logger } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('initiate')
  async initiateUpload(@Body() body: { filename: string; contentType: string }) {
    this.logger.log(
      `🚀 [BACKEND STEP 1] Initiating upload for ${body.filename}, type: ${body.contentType}`,
    );
    const result = await this.uploadService.initiateMultipartUpload(
      body.filename,
      body.contentType,
    );
    this.logger.log(`✅ Upload initiated. UploadId: ${result.uploadId}, Key: ${result.key}`);
    return result;
  }

  @Post('url')
  async getUploadUrl(@Body() body: { key: string; uploadId: string; partNumber: number }) {
    this.logger.log(
      `🔗 [BACKEND STEP 2] Getting signed URL for part ${body.partNumber}, key: ${body.key}, uploadId: ${body.uploadId}`,
    );
    const result = await this.uploadService.getSignedUploadUrl(
      body.key,
      body.uploadId,
      body.partNumber,
    );
    this.logger.log(`✅ Signed URL generated for part ${body.partNumber}`);
    return result;
  }

  @Post('complete')
  async completeUpload(
    @Body()
    body: {
      key: string;
      uploadId: string;
      parts: Array<{ PartNumber: number; ETag: string }>;
    },
  ) {
    this.logger.log(
      `🏁 [BACKEND STEP 3] Completing upload for ${body.key}, uploadId: ${body.uploadId}, parts count: ${body.parts.length}`,
    );
    this.logger.debug(`Parts received: ${JSON.stringify(body.parts)}`);
    const result = await this.uploadService.completeMultipartUpload(
      body.key,
      body.uploadId,
      body.parts,
    );
    this.logger.log(`🎉 Upload completed successfully! Location: ${result.location}`);
    return result;
  }

  @Post('abort')
  async abortUpload(@Body() body: { key: string; uploadId: string }) {
    this.logger.log(`❌ [BACKEND ABORT] Aborting upload for ${body.key}`);
    const result = await this.uploadService.abortMultipartUpload(body.key, body.uploadId);
    this.logger.log(`Upload aborted successfully`);
    return result;
  }
}
