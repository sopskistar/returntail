import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pool, transaction } from '../src/server/db';
const sql = await readFile(new URL('../migrations/0001_returntail.sql', import.meta.url), 'utf8');
const hash = createHash('sha256').update(sql).digest('hex');
await transaction(async (db) => {
  await db.query('SELECT pg_advisory_xact_lock(8910172026)');
  await db.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const old = await db.query('SELECT hash FROM schema_migrations WHERE name=$1', [
    '0001_returntail',
  ]);
  if (old.rows.length) {
    if (old.rows[0].hash !== hash)
      throw Error('Applied migration checksum changed. Create a new migration.');
    console.log('Migration already applied; checksum verified.');
    return;
  }
  await db.query(sql);
  await db.query('INSERT INTO schema_migrations(name,hash) VALUES($1,$2)', [
    '0001_returntail',
    hash,
  ]);
  console.log('Applied 0001_returntail atomically.');
});
await pool().end();
