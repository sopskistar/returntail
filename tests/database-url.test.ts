import { describe, expect, it } from 'vitest';
import { databaseConnectionString } from '../src/server/database-url';
describe('explicit PostgreSQL TLS configuration', () => {
  it('retains certificate and hostname verification when normalizing pg 8 aliases', () => {
    for (const mode of ['prefer', 'require', 'verify-ca']) {
      // Synthetic values only; no external database exists at the .invalid host.
      const fixture = new URL(`postgresql://database.invalid/db?sslmode=${mode}&channel_binding=require`);
      fixture.username = 'isolated-fixture'; fixture.password = 'example@value';
      const normalized = new URL(databaseConnectionString(fixture.toString()));
      expect(normalized.searchParams.get('sslmode')).toBe('verify-full');
      expect(normalized.searchParams.get('channel_binding')).toBe('require');
      expect(normalized.password).toBe('example%40value');
    }
  });
  it('does not change local test URLs or explicit libpq compatibility', () => {
    for (const url of ['postgresql://localhost:55432/returntail?options=-csearch_path%3Dtest', 'postgresql://database.invalid/db?sslmode=require&uselibpqcompat=true', 'postgresql://database.invalid/db?sslmode=verify-full'])
      expect(databaseConnectionString(url)).toBe(url);
  });
});
