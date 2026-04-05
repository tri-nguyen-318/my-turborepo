import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  // ─── Signup ──────────────────────────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('creates a user and returns access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Password1!', name: 'Test User' })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.password).toBeUndefined();
    });

    it('returns 409 on duplicate email', async () => {
      const payload = { email: 'dup@example.com', password: 'Password1!' };
      await request(app.getHttpServer()).post('/auth/signup').send(payload).expect(201);
      await request(app.getHttpServer()).post('/auth/signup').send(payload).expect(409);
    });

    it('returns 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'not-an-email', password: 'Password1!' })
        .expect(400);
    });

    it('returns 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com' })
        .expect(400);
    });
  });

  // ─── Signin ──────────────────────────────────────────────────────────────────

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'signin@example.com', password: 'Password1!' });
    });

    it('returns access_token with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'signin@example.com', password: 'Password1!' })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe('signin@example.com');
    });

    it('returns 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'signin@example.com', password: 'WrongPass!' })
        .expect(401);
    });

    it('returns 401 for unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nobody@example.com', password: 'Password1!' })
        .expect(401);
    });
  });

  // ─── Profile ─────────────────────────────────────────────────────────────────

  describe('GET /auth/profile', () => {
    it('returns profile when authenticated', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'profile@example.com', password: 'Password1!', name: 'Profile User' });

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(200);

      expect(res.body.email).toBe('profile@example.com');
      expect(res.body.password).toBeUndefined();
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('returns 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('logs out and clears cookies', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'logout@example.com', password: 'Password1!' });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(201);

      expect(res.body.message).toBe('Logged out');
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
