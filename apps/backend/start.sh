#!/bin/sh
set -e

echo "Pushing Prisma schema..."
cd /app/packages/database && npx prisma db push

echo "Starting backend services..."
node /app/apps/backend/dist/apps/info-service/main.js &
node /app/apps/backend/dist/apps/upload-service/main.js &
node /app/apps/backend/dist/apps/api/main.js
