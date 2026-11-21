import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pool, transaction } from '../src/server/db';
const directory = new URL('../migrations/', import.meta.url);
const files = (await readdir(directory)).filter((name) => /^\d{4}_[\w]+\.sql$/.test(name)).sort();
await transaction(async (db) => {
  await db.query('SELECT pg_advisory_xact_lock(8910172026)');
  await db.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  for (const file of files) {
    const name = file.slice(0, -4);
    const sql = await readFile(new URL(file, directory), 'utf8');
    const hash = createHash('sha256').update(sql).digest('hex');
    const old = await db.query('SELECT hash FROM schema_migrations WHERE name=$1', [name]);
    if (old.rows.length) {
      if (old.rows[0].hash !== hash)
        throw Error('Applied migration checksum changed. Create a new migration.');
      console.log(`${name} already applied; checksum verified.`);
      continue;
    }
    await db.query(sql);
    await db.query('INSERT INTO schema_migrations(name,hash) VALUES($1,$2)', [name, hash]);
    console.log(`Applied ${name} atomically.`);
  }
});
await pool().end();
