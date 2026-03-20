import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from '../application/upload.service';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('initiate')
  initiate(@Body() body: { filename: string; contentType: string }) {
    return this.uploadService.initiate(body.filename, body.contentType);
  }

  @Post('url')
  getSignedUrl(@Body() body: { key: string; uploadId: string; partNumber: number }) {
    return this.uploadService.getSignedUrl(body.key, body.uploadId, body.partNumber);
  }

  @Post('complete')
  complete(
    @Body() body: { key: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] },
  ) {
    return this.uploadService.complete(body.key, body.uploadId, body.parts);
  }

  @Post('abort')
  abort(@Body() body: { key: string; uploadId: string }) {
    return this.uploadService.abort(body.key, body.uploadId);
  }
}
