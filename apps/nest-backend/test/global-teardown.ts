import { execSync } from 'child_process';
import * as path from 'path';

const COMPOSE_FILE = path.resolve(__dirname, '../docker-compose.test.yml');

export default async function globalTeardown() {
  console.log('\n🛑  Stopping test database...');
  execSync(`docker compose -f "${COMPOSE_FILE}" down`, { stdio: 'inherit' });
}
