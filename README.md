# My Turborepo

A full-stack monorepo built with Turborepo, featuring a Next.js next-frontend and NestJS backend with large video file multipart uploads, real-time chat, authentication, and more.

## Apps

| App                  | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `apps/next-frontend` | Next.js 16 app — upload UI, chat, auth, leaderboard, i18n (EN/VI)           |
| `apps/backend`       | NestJS API — auth, upload, chat gateway, profile, Prisma ORM                |
| `apps/aws-lab`       | Standalone AWS learning lab (S3, DynamoDB, SQS, SNS, Lambda via LocalStack) |

## Tech Stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Frontend  | Next.js 16, React 19, TailwindCSS 4, Radix UI, React Query |
| Backend   | NestJS 10, TypeScript, Prisma 7                            |
| Database  | PostgreSQL (Prisma), MongoDB (Mongoose)                    |
| Storage   | MinIO (local) / AWS S3 (production)                        |
| Real-time | Socket.IO 4                                                |
| Auth      | JWT, Google OAuth 2.0                                      |
| Build     | Turborepo 2, pnpm 10                                       |

## Prerequisites

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose

## Run with Docker (one command)

> Runs the full stack — next-frontend, backend, PostgreSQL, and MinIO — with no local setup required.

### 1. Configure secrets

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
JWT_SECRET=any-long-random-string
```

Optional extras (Google OAuth, Groq AI, SMTP email):

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GROQ_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### 2. Start

```bash
docker compose up --build
```

| Service       | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:3000 |
| Backend API   | http://localhost:3001 |
| MinIO Console | http://localhost:9003 |

> First build takes a few minutes. After that: `docker compose up`

### 3. First-time MinIO setup

1. Open http://localhost:9003, log in: `minioadmin` / `minioadminpassword`
2. Go to **Buckets → uploads → Access Policy** → set to **Public**

### Stop

```bash
docker compose down       # stop, keep data
docker compose down -v    # stop and wipe all volumes
```

### Deploying to a remote server

Set `NEXT_PUBLIC_API_URL` in `.env` to the public backend URL before building:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

Then rebuild: `docker compose up --build`

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start local services

```bash
docker-compose up -d
```

This starts PostgreSQL, MongoDB, Redis, MinIO, RabbitMQ, and LocalStack.

| Service          | URL                    |
| ---------------- | ---------------------- |
| MinIO console    | http://localhost:9002  |
| RabbitMQ console | http://localhost:15673 |
| LocalStack       | http://localhost:4566  |

### 3. Set up environment variables

**Backend** — copy and fill in `apps/backend/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5434/mydatabase?schema=public
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# MinIO / S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadminpassword
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=video-uploads

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend** — create `apps/next-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run database migrations

```bash
cd apps/backend
pnpm db:push
```

### 5. Start development

```bash
# From repo root — starts all apps in parallel
pnpm dev
```

| App      | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |

## Available Scripts

Run from the repo root:

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm lint:fix     # Fix lint issues
pnpm format       # Format with Prettier
pnpm typecheck    # Type-check all apps
```

Run a specific app:

```bash
pnpm --filter next-frontend dev
pnpm --filter backend dev
```

## Upload Flow

```
Frontend → POST /upload/initiate   → Backend creates multipart upload in S3
Frontend → GET  /upload/presigned  → Backend returns presigned URLs per chunk
Frontend → PUT  (direct to S3)     → Chunks uploaded in parallel
Frontend → POST /upload/complete   → Backend finalises the multipart upload
```

## Deployment

| App             | Platform | Notes                                                                              |
| --------------- | -------- | ---------------------------------------------------------------------------------- |
| `next-frontend` | Vercel   | Connect repo, set root to `apps/next-frontend`                                     |
| `backend`       | Render   | Docker deploy, Dockerfile at `apps/backend/Dockerfile`, build context at repo root |

**Render environment variables** required at runtime:
`DATABASE_URL`, `FRONTEND_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and S3/MinIO credentials.

## Project Structure

```
my-turborepo/
├── apps/
│   ├── next-frontend/               # Next.js app
│   │   └── src/
│   │       ├── app/[locale]/   # Pages with i18n routing
│   │       ├── components/ui/  # Shared UI components
│   │       └── lib/api/        # API client functions
│   ├── backend/                # NestJS API
│   │   └── src/
│   │       └── modules/
│   │           ├── auth/       # JWT + Google OAuth
│   │           ├── upload/     # S3 multipart upload
│   │           ├── chat/       # WebSocket gateway
│   │           └── profile/    # User profile
│   └── aws-lab/                # AWS SDK exercises
├── docker-compose.yml          # Local dev services
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml
```
