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
  user?: { userId: number; email: string } | null;
}

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
  @UseGuards(OptionalJwtAuthGuard)
  complete(
    @Body() body: { key: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] },
    @Request() req: JwtRequest,
  ) {
    return this.uploadService.complete(body.key, body.uploadId, body.parts, req.user?.userId);
  }

  @Post('abort')
  abort(@Body() body: { key: string; uploadId: string }) {
    return this.uploadService.abort(body.key, body.uploadId);
  }

  @Get('files')
  @UseGuards(OptionalJwtAuthGuard)
  listFiles(@Request() req: JwtRequest) {
    return this.uploadService.listFiles(req.user?.userId, req.user?.email);
  }

  @Delete('files/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteFile(@Param('id', ParseIntPipe) id: number, @Request() req: JwtRequest) {
    return this.uploadService.deleteFile(id, req.user?.userId, req.user?.email);
  }
}
