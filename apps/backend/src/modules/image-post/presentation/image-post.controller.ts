import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt.guard';
import { ImagePostService } from '../application/image-post.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

interface JwtRequest {
  user: { userId: number; email: string; role: string };
}

@Controller('api/image-posts')
export class ImagePostController {
  constructor(private readonly imagePostService: ImagePostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createPost(@Request() req: JwtRequest, @Body() dto: CreatePostDto) {
    return this.imagePostService.createPost(req.user.userId, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Request() req: { user?: { userId: number } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.imagePostService.findAll(req.user?.userId, page);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  toggleLike(@Param('id', ParseIntPipe) id: number, @Request() req: JwtRequest) {
    return this.imagePostService.toggleLike(id, req.user.userId);
  }

  @Get(':id/comments')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.imagePostService.getComments(id);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: JwtRequest,
    @Body() dto: CreateCommentDto,
  ) {
    return this.imagePostService.addComment(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  deletePost(@Param('id', ParseIntPipe) id: number, @Request() req: JwtRequest) {
    return this.imagePostService.deletePost(id, req.user.userId, req.user.role);
  }
}
