# My Turborepo

A full-stack monorepo built with Turborepo, featuring a Next.js next-frontend and NestJS nest-backend with large video file multipart uploads, real-time chat, authentication, and more.

## Apps

| App                  | Tech       | Port | Description                                                       |
| -------------------- | ---------- | ---- | ----------------------------------------------------------------- |
| `apps/next-frontend` | Next.js 16 | 3000 | Next.js 16 app — upload UI, chat, auth, leaderboard, i18n (EN/VI) |
| `apps/nest-backend`  | NestJS 10  | 3001 | NestJS API — auth, upload, chat gateway, profile, Prisma ORM      |
| `apps/go-backend`    | Go + Fiber | 8080 | Go REST API — book management, PostgreSQL, Swagger docs           |
| `apps/aws-lab`       | Standalone | -    | AWS learning lab (S3, DynamoDB, SQS, SNS, Lambda via LocalStack)  |

## Architecture Diagram

### Production Deployment

```mermaid
graph TB

    subgraph Production["Production Deployment"]
        vercel["🚀 Vercel<br/>Next.js Frontend<br/>port 3000"]

        nest["🚀 Render<br/>NestJS Backend<br/>port 3001"]
        go["🚀 Cloud Run<br/>Go Backend<br/>port 8080"]

        %% Databases
        nestDB[(🗄 Supabase PostgreSQL<br/>NestJS DB)]
        goDB[(🗄 Supabase PostgreSQL<br/>Go DB)]

        %% Connections
        nest -->|PostgreSQL| nestDB
        go -->|PostgreSQL| goDB

        nest <-->|HTTP / REST| go
    end

    subgraph Browser["Client"]
        user["👤 Browser"]
    end

    user -->|HTTPS| vercel
    vercel -->|API → Nest| nest
    vercel -->|API → Go| go
```

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

## Run with Docker

### Run Individual Services with Databases

Each service has its own `docker-compose.yml` with its database and environment pre-configured.

**Go Backend + PostgreSQL:**

```bash
docker compose -f apps/go-backend/docker-compose.yml up --build
```

- Go API: http://localhost:8080
- API Docs: http://localhost:8080/swagger/index.html
- PostgreSQL: localhost:5435 (go_user / go_password)

**NestJS Backend + PostgreSQL:**

```bash
docker compose -f apps/nest-backend/docker-compose.yml up --build
```

- NestJS API: http://localhost:3001
- PostgreSQL: localhost:5432

**Next.js Frontend:**

```bash
docker compose -f apps/next-frontend/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- Requires nest-backend running at http://localhost:3001

### Configure Environment Variables

**Root `.env`** (for docker compose up):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://nestuser:nestpass@postgres:5432/nestdb
```

**App-specific `.env`** (when running isolated):

- `apps/go-backend/.env` — Go backend config
- `apps/nest-backend/.env` — NestJS backend config
- `apps/next-frontend/.env.local` — Next.js config

### Stop Services

```bash
docker compose down           # stop, keep data
docker compose down -v        # stop and remove volumes (deletes databases)

# For individual services:
docker compose -f apps/go-backend/docker-compose.yml down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f go-backend
docker compose logs -f nest-backend
```

### First-time Setup (if using MinIO)

1. Open http://localhost:9003, log in: `minioadmin` / `minioadminpassword`
2. Go to **Buckets → uploads → Access Policy** → set to **Public**

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

**Backend** — copy and fill in `apps/nest-backend/.env`:

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
cd apps/nest-backend
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
pnpm --filter nest-backend dev
```

## Upload Flow

```
Frontend → POST /upload/initiate   → Backend creates multipart upload in S3
Frontend → GET  /upload/presigned  → Backend returns presigned URLs per chunk
Frontend → PUT  (direct to S3)     → Chunks uploaded in parallel
Frontend → POST /upload/complete   → Backend finalises the multipart upload
```

## Deployment

| App             | Platform | Notes                                                                                   |
| --------------- | -------- | --------------------------------------------------------------------------------------- |
| `next-frontend` | Vercel   | Connect repo, set root to `apps/next-frontend`                                          |
| `nest-backend`  | Render   | Docker deploy, Dockerfile at `apps/nest-backend/Dockerfile`, build context at repo root |

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
│   ├── nest-backend/                # NestJS API
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
