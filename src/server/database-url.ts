/** Make pg 8's current certificate-verifying alias behavior explicit before pg 9.
 * Never log the returned URL: it contains credentials. Local URLs without SSL
 * options and explicitly requested libpq compatibility keep their configuration.
 */
export function databaseConnectionString(value: string): string {
  const url = new URL(value);
  const mode = url.searchParams.get('sslmode');
  if (['prefer', 'require', 'verify-ca'].includes(mode ?? '') &&
      url.searchParams.get('uselibpqcompat') !== 'true') {
    url.searchParams.set('sslmode', 'verify-full');
    return url.toString();
  }
  return value;
}
