import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    // Vercel Postgres provides POSTGRES_URL, fallback to DATABASE_URL for local dev
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}
