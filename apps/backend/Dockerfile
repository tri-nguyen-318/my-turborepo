FROM node:22-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "apps/backend/dist/main"]
