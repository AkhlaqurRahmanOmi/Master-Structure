import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then((client) => {
    console.log('✅ Database connected successfully!');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to the database:', err.message);
  });

export const db = drizzle(pool, { schema });

export const drizzleProvider = {
  provide: 'DRIZZLE',
  useValue: db,
};
