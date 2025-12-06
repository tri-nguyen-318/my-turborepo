# Video Upload Turborepo

A full-stack monorepo for handling large video file uploads using S3/MinIO multipart upload with Next.js frontend and NestJS backend.

## Features

- 🎥 **Large Video Upload**: Multipart upload for handling huge video files
- 🚀 **Parallel Uploads**: Upload file chunks in parallel for faster transfers
- 🔄 **Retry Logic**: Automatic retry with exponential backoff
- 🌍 **i18n Support**: Internationalization with next-intl
- 🐳 **MinIO Integration**: S3-compatible object storage for local development
- 📦 **Turborepo**: Efficient monorepo with shared packages

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `frontend`: a [Next.js](https://nextjs.org/) app with video upload UI
- `backend`: a [NestJS](https://nestjs.com/) API server for multipart upload handling
- `@repo/eslint-config`: shared `eslint` configurations
- `@repo/typescript-config`: shared `tsconfig.json`s

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker and Docker Compose

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd my-turborepo
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   **Frontend** (`apps/frontend/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/upload
   ```

   **Backend** (`apps/backend/.env`):

   ```env
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000

   # MinIO Configuration
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadminpassword
   MINIO_USE_SSL=false
   MINIO_BUCKET_NAME=video-uploads
   ```

### Running the Application

1. **Start MinIO** (S3-compatible object storage)

   ```bash
   docker-compose up -d
   ```

2. **Start the backend** (NestJS API)

   ```bash
   cd apps/backend
   yarn dev
   ```

   Backend will be available at `http://localhost:3001`

3. **Start the frontend** (Next.js app)

   ```bash
   cd apps/frontend
   yarn dev
   ```

   Frontend will be available at `http://localhost:3000`

4. **Access MinIO Console** (optional)
   - URL: `http://localhost:9001`
   - Username: `minioadmin`
   - Password: `minioadminpassword`

### Running Everything at Once

From the root directory:

```bash
# Start MinIO
docker-compose up -d

# Start all apps in parallel
yarn dev
```

## Available Scripts

- `yarn dev` - Start all apps in development mode
- `yarn build` - Build all apps and packages
- `yarn lint` - Lint all packages
- `yarn lint:fix` - Fix linting issues
- `yarn format` - Format code with Prettier
- `yarn check-types` - Type check all packages

## Architecture

### Upload Flow

1. **Initiate Upload**: Frontend requests upload initialization from backend
2. **Get Signed URLs**: For each chunk, frontend gets a pre-signed URL from backend
3. **Upload Chunks**: Frontend uploads chunks directly to MinIO in parallel
4. **Complete Upload**: Frontend notifies backend to complete the multipart upload
5. **File Available**: Video is stored in MinIO bucket

### Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4, next-intl, Lucide Icons
- **Backend**: NestJS, AWS SDK S3, TypeScript
- **Storage**: MinIO (S3-compatible)
- **Build**: Turborepo, TypeScript, ESLint, Prettier

## Project Structure

```
my-turborepo/
├── apps/
│   ├── frontend/          # Next.js video upload UI
│   │   ├── app/
│   │   │   └── components/
│   │   │       └── video-uploader/  # Modular upload components
│   │   ├── messages/      # i18n translations
│   │   └── .env.local     # Frontend environment variables
│   └── backend/           # NestJS API server
│       ├── src/
│       │   ├── upload/    # Upload module with multipart logic
│       │   └── s3-config.service.ts
│       └── .env           # Backend environment variables
├── packages/
│   ├── eslint-config/     # Shared ESLint configs
│   └── typescript-config/ # Shared TypeScript configs
├── docker-compose.yml     # MinIO setup
└── turbo.json            # Turborepo configuration
```

## Development

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages:

```bash
yarn build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
