import { execSync } from 'child_process';
import * as path from 'path';

const COMPOSE_FILE = path.resolve(__dirname, '../docker-compose.test.yml');
const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5435/test_db';

export default async function globalSetup() {
  console.log('\n🐳  Starting test database...');
  execSync(`docker compose -f "${COMPOSE_FILE}" up -d --wait`, { stdio: 'inherit' });

  console.log('🗑️   Resetting test DB...');
  execSync(
    `docker compose -f "${COMPOSE_FILE}" exec -T postgres-test dropdb -U postgres --if-exists test_db`,
    { stdio: 'inherit' },
  );
  execSync(
    `docker compose -f "${COMPOSE_FILE}" exec -T postgres-test createdb -U postgres test_db`,
    { stdio: 'inherit' },
  );

  console.log('🔧  Pushing Prisma schema to test DB...');
  execSync('npx prisma db push', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });

  console.log('✅  Test DB ready\n');
}
