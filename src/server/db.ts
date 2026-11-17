import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { AppError } from '@/core/errors';
const globalDb = globalThis as unknown as { returntailPool?: Pool };
export function pool(): Pool {
  if (!process.env.DATABASE_URL)
    throw new AppError(
      'SETUP_REQUIRED',
      'Configure DATABASE_URL and run database migrations to open the workspace.',
      503,
    );
  return (globalDb.returntailPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 7000,
    idleTimeoutMillis: 10000,
  }));
}
export interface Sql {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
}
export async function transaction<T>(fn: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await pool().connect();
  try {
    await db.query('BEGIN');
    const result = await fn(db);
    await db.query('COMMIT');
    return result;
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    db.release();
  }
}
