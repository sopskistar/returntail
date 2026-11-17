export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  body?: unknown,
  capability?: string,
  key?: string,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(capability ? { Authorization: `Bearer ${capability}` } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json();
  if (!response.ok)
    throw new ApiError(json.message ?? 'Request failed.', json.error ?? 'UNKNOWN', response.status);
  return json as T;
}
export const requestKey = () => crypto.randomUUID();
export const message = (e: unknown) =>
  e instanceof Error ? e.message : 'This action could not be completed. Try again.';
