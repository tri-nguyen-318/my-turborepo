import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post('initiate')
  initiate(@Body() body: { filename: string; contentType: string }) {
    return this.service.initiate(body.filename, body.contentType);
  }

  @Post('url')
  url(@Body() body: { key: string; uploadId: string; partNumber: number }) {
    return this.service.getSignedUrl(body.key, body.uploadId, body.partNumber);
  }

  @Post('complete')
  complete(@Body() body: { key: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] }) {
    return this.service.complete(body.key, body.uploadId, body.parts);
  }

  @Post('abort')
  abort(@Body() body: { key: string; uploadId: string }) {
    return this.service.abort(body.key, body.uploadId);
  }
}
