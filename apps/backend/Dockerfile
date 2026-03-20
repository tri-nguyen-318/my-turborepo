FROM node:22-alpine

# Install required libs
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

# Copy root deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package + prisma early (for caching)
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy full source
COPY . .

# Generate Prisma client
RUN pnpm --filter backend exec prisma generate

# Build backend
RUN pnpm --filter backend run build

# Set production env
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# 🚀 Run migration + start app
CMD ["sh", "-c", "pnpm --filter backend exec prisma db push && node apps/backend/dist/main"]