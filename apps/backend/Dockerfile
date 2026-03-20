# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

# --shamefully-hoist puts all packages directly in root node_modules
# so they are resolvable regardless of working directory in the runner
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build

# ---- Stage 3: Runner ----
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma

EXPOSE 3003

CMD ["node", "dist/main"]
