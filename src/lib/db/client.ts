import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Module-level singleton — reused across requests within one Node process,
// same lifecycle convention as src/lib/conversation/store.ts's singleton.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
