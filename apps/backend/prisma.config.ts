import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter(env: NodeJS.ProcessEnv) {
      return new PrismaPg({ connectionString: env.DATABASE_URL! });
    },
  },
});
