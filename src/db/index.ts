import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Support both Neon HTTP serverless connection and standard PostgreSQL TCP pool
let dbInstance;

if (connectionString.includes('neon.tech')) {
  const sql = neon(connectionString);
  dbInstance = drizzleNeon(sql, { schema });
} else {
  const pool = new Pool({ connectionString });
  dbInstance = drizzlePg(pool, { schema });
}

export const db = dbInstance;
