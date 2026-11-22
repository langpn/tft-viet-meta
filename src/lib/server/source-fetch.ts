import { createHash } from 'node:crypto';

export function sha256(content: string | Uint8Array): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function fetchSource(responseUrl: string, fetchFn = fetch) {
  const response = await fetchFn(responseUrl, { signal: AbortSignal.timeout(25_000) });
  if (!response.ok) throw new Error(`${responseUrl} returned HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { text: new TextDecoder().decode(bytes), headers: response.headers, sha256: sha256(bytes) };
}

export function sourceRows(value: unknown, source: string): Record<string, any>[] {
  if (!Array.isArray(value) || !value.length || value.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error(`${source}: expected a non-empty array of records`);
  }
  return value;
}
