FROM node:22-alpine

# Install required libs
RUN apk add --no-cache libc6-compat openssl ca-certificates

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

# Copy root deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy nest-backend package + prisma early (for caching)
COPY apps/nest-backend/package.json ./apps/nest-backend/
COPY apps/nest-backend/prisma ./apps/nest-backend/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy full source
COPY . .

# Generate Prisma client
RUN pnpm --filter nest-backend exec prisma generate

# Build nest-backend
RUN pnpm --filter nest-backend run build

# Set production env
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# 🚀 Run migration + start app
CMD ["sh", "-c", "pnpm --filter nest-backend exec prisma db push --accept-data-loss && node apps/nest-backend/dist/main"]