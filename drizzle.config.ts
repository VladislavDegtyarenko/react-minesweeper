import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL must be set for drizzle-kit. ' +
      'Add the unpooled Neon connection string to .env.local before running migrations.',
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/utils/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
