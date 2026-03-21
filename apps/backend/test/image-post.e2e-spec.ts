import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { PrismaService } from '../src/shared/database/prisma.service';

async function signupAndGetToken(
  app: INestApplication,
  email: string,
  password = 'Password1!',
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password, name: email.split('@')[0] });
  return res.body.access_token as string;
}

describe('ImagePost (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean in FK-safe order
    await prisma.imagePostComment.deleteMany();
    await prisma.imagePostLike.deleteMany();
    await prisma.imagePost.deleteMany();
    await prisma.user.deleteMany();

    ownerToken = await signupAndGetToken(app, 'owner@example.com');
    otherToken = await signupAndGetToken(app, 'other@example.com');
  });

  // ─── List posts ──────────────────────────────────────────────────────────────

  describe('GET /api/image-posts', () => {
    it('returns paginated response with empty data', async () => {
      const res = await request(app.getHttpServer()).get('/api/image-posts').expect(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
      expect(res.body.hasMore).toBe(false);
    });

    it('returns created posts', async () => {
      await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'Hello world' });

      const res = await request(app.getHttpServer()).get('/api/image-posts').expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].caption).toBe('Hello world');
    });

    it('sets userLiked=false for unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' });

      const res = await request(app.getHttpServer()).get('/api/image-posts').expect(200);
      expect(res.body.data[0].userLiked).toBe(false);
    });

    it('sets userLiked=true for a post the user liked', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' });

      await request(app.getHttpServer())
        .post(`/api/image-posts/${createRes.body.id}/like`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const res = await request(app.getHttpServer())
        .get('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.data[0].userLiked).toBe(true);
    });

    it('paginates with ?page=2', async () => {
      for (let i = 0; i < 11; i++) {
        await request(app.getHttpServer())
          .post('/api/image-posts')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({ url: 'https://picsum.photos/800/600', caption: `Post ${i}` });
      }

      const page1 = await request(app.getHttpServer()).get('/api/image-posts?page=1').expect(200);
      const page2 = await request(app.getHttpServer()).get('/api/image-posts?page=2').expect(200);

      expect(page1.body.data).toHaveLength(10);
      expect(page2.body.data).toHaveLength(1);
      expect(page1.body.hasMore).toBe(true);
      expect(page2.body.hasMore).toBe(false);
    });
  });

  // ─── Create post ─────────────────────────────────────────────────────────────

  describe('POST /api/image-posts', () => {
    it('creates a post and returns it', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'My first post' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.caption).toBe('My first post');
      expect(res.body.likes).toBe(0);
      expect(res.body.comments).toBe(0);
    });

    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/image-posts')
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' })
        .expect(401);
    });

    it('returns 400 for an invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'not-a-url', caption: 'test' })
        .expect(400);
    });

    it('returns 400 when caption is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600' })
        .expect(400);
    });

    it('stores blurDataUrl when provided', async () => {
      const blurDataUrl = 'data:image/jpeg;base64,/9j/abc123';
      const res = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'blur test', blurDataUrl })
        .expect(201);

      expect(res.body.blurDataUrl).toBe(blurDataUrl);
    });
  });

  // ─── Like / unlike ───────────────────────────────────────────────────────────

  describe('POST /api/image-posts/:id/like', () => {
    let postId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'likeable' });
      postId = res.body.id as number;
    });

    it('increments likes on first like', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/like`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(201);

      expect(res.body.liked).toBe(true);
      expect(res.body.likes).toBe(1);
    });

    it('decrements likes on second like (toggle)', async () => {
      await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/like`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const res = await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/like`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(201);

      expect(res.body.liked).toBe(false);
      expect(res.body.likes).toBe(0);
    });

    it('allows different users to like the same post', async () => {
      await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/like`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const res = await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/like`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(201);

      expect(res.body.likes).toBe(2);
    });

    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).post(`/api/image-posts/${postId}/like`).expect(401);
    });
  });

  // ─── Comments ────────────────────────────────────────────────────────────────

  describe('GET /api/image-posts/:id/comments', () => {
    it('returns empty array when no comments', async () => {
      const { body: post } = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' });

      const res = await request(app.getHttpServer())
        .get(`/api/image-posts/${post.id}/comments`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns comments in ascending order', async () => {
      const { body: post } = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' });

      await request(app.getHttpServer())
        .post(`/api/image-posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ body: 'First comment' });

      await request(app.getHttpServer())
        .post(`/api/image-posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ body: 'Second comment' });

      const res = await request(app.getHttpServer())
        .get(`/api/image-posts/${post.id}/comments`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].body).toBe('First comment');
      expect(res.body[1].body).toBe('Second comment');
    });
  });

  describe('POST /api/image-posts/:id/comments', () => {
    let postId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'test' });
      postId = res.body.id as number;
    });

    it('adds a comment and increments counter', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ body: 'Nice post!' })
        .expect(201);

      expect(res.body.body).toBe('Nice post!');
      expect(res.body.imagePostId).toBe(postId);

      const feed = await request(app.getHttpServer()).get('/api/image-posts').expect(200);
      expect(feed.body.data[0].comments).toBe(1);
    });

    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/comments`)
        .send({ body: 'test' })
        .expect(401);
    });

    it('returns 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post(`/api/image-posts/${postId}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ body: '' })
        .expect(400);
    });
  });

  // ─── Delete post ─────────────────────────────────────────────────────────────

  describe('DELETE /api/image-posts/:id', () => {
    let postId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/image-posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ url: 'https://picsum.photos/800/600', caption: 'deletable' });
      postId = res.body.id as number;
    });

    it('owner can delete their own post', async () => {
      await request(app.getHttpServer())
        .delete(`/api/image-posts/${postId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const feed = await request(app.getHttpServer()).get('/api/image-posts').expect(200);
      expect(feed.body.total).toBe(0);
    });

    it('returns 403 when a non-owner tries to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/api/image-posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).delete(`/api/image-posts/${postId}`).expect(401);
    });

    it('returns 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .delete('/api/image-posts/999999')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });
});
