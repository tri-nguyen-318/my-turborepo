import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from '../application/upload.service';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt.guard';

interface JwtRequest {
  user?: { userId: number; email: string; role?: string } | null;
}

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('initiate')
  @UseGuards(OptionalJwtAuthGuard)
  initiate(@Body() body: { filename: string; contentType: string; isPublic?: boolean }) {
    return this.uploadService.initiate(body.filename, body.contentType, body.isPublic ?? false);
  }

  @Post('url')
  getSignedUrl(
    @Body() body: { bucket: string; key: string; uploadId: string; partNumber: number },
  ) {
    return this.uploadService.getSignedUrl(body.bucket, body.key, body.uploadId, body.partNumber);
  }

  @Post('complete')
  @UseGuards(OptionalJwtAuthGuard)
  complete(
    @Body()
    body: {
      bucket: string;
      key: string;
      uploadId: string;
      parts: { PartNumber: number; ETag: string }[];
      isPublic?: boolean;
    },
    @Request() req: JwtRequest,
  ) {
    return this.uploadService.complete(
      body.bucket,
      body.key,
      body.uploadId,
      body.parts,
      body.isPublic ?? false,
      req.user?.userId,
    );
  }

  @Post('abort')
  abort(@Body() body: { bucket: string; key: string; uploadId: string }) {
    return this.uploadService.abort(body.bucket, body.key, body.uploadId);
  }

  @Get('files')
  @UseGuards(AuthGuard('jwt'))
  listFiles(@Request() req: JwtRequest) {
    return this.uploadService.listFiles(req.user?.userId, req.user?.role);
  }

  @Delete('files/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteFile(@Param('id', ParseIntPipe) id: number, @Request() req: JwtRequest) {
    return this.uploadService.deleteFile(id, req.user?.userId, req.user?.role);
  }
}
