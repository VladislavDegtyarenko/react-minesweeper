import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DrizzleDb = NeonHttpDatabase<typeof schema>;

let cachedDb: DrizzleDb | null = null;

const createDb = (): DrizzleDb => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add the pooled Neon connection string to .env.local.',
    );
  }

  return drizzle(neon(databaseUrl), { schema });
};

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get: (_target, prop, receiver) => {
    if (!cachedDb) {
      cachedDb = createDb();
    }

    return Reflect.get(cachedDb, prop, receiver);
  },
});

export { schema };
export * from './types';
export { LEVEL_IDS } from './constants';
