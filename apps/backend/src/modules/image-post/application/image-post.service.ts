import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateCommentDto } from '../presentation/dto/create-comment.dto';
import { CreatePostDto } from '../presentation/dto/create-post.dto';

@Injectable()
export class ImagePostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number, page = 1) {
    const PAGE_SIZE = 10;
    const skip = (page - 1) * PAGE_SIZE;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.imagePost.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: PAGE_SIZE,
      }),
      this.prisma.imagePost.count(),
    ]);

    let postsWithMeta = posts.map(p => ({ ...p, userLiked: false }));

    if (userId) {
      const likes = await this.prisma.imagePostLike.findMany({
        where: { userId, imagePostId: { in: posts.map(p => p.id) } },
        select: { imagePostId: true },
      });
      const likedSet = new Set(likes.map(l => l.imagePostId));
      postsWithMeta = posts.map(p => ({ ...p, userLiked: likedSet.has(p.id) }));
    }

    return { data: postsWithMeta, total, page, hasMore: skip + PAGE_SIZE < total };
  }

  async createPost(userId: number, dto: CreatePostDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || user?.email || 'Anonymous';
    return this.prisma.imagePost.create({
      data: { userId, userName, url: dto.url, caption: dto.caption, blurDataUrl: dto.blurDataUrl },
    });
  }

  async toggleLike(postId: number, userId: number) {
    await this.findOrThrow(postId);

    const existing = await this.prisma.imagePostLike.findUnique({
      where: { imagePostId_userId: { imagePostId: postId, userId } },
    });

    if (existing) {
      const [, post] = await this.prisma.$transaction([
        this.prisma.imagePostLike.delete({ where: { id: existing.id } }),
        this.prisma.imagePost.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
      ]);
      return { liked: false, likes: post.likes };
    }

    const [, post] = await this.prisma.$transaction([
      this.prisma.imagePostLike.create({ data: { imagePostId: postId, userId } }),
      this.prisma.imagePost.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
    ]);
    return { liked: true, likes: post.likes };
  }

  getComments(postId: number) {
    return this.prisma.imagePostComment.findMany({
      where: { imagePostId: postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(postId: number, userId: number, dto: CreateCommentDto) {
    await this.findOrThrow(postId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || user?.email || 'Anonymous';

    const [comment] = await this.prisma.$transaction([
      this.prisma.imagePostComment.create({
        data: { imagePostId: postId, userId, userName, body: dto.body },
      }),
      this.prisma.imagePost.update({ where: { id: postId }, data: { comments: { increment: 1 } } }),
    ]);
    return comment;
  }

  async deletePost(postId: number, userId: number, email: string) {
    const post = await this.findOrThrow(postId);

    const isOwner = post.userId === userId;
    const isAdmin = email === 'nguyenhuutri31081999nht@gmail.com';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not allowed to delete this post');
    }

    await this.prisma.imagePost.delete({ where: { id: postId } });
    return { deleted: true };
  }

  private async findOrThrow(id: number) {
    const post = await this.prisma.imagePost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`ImagePost #${id} not found`);
    return post;
  }
}
