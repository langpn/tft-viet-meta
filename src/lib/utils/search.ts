/**
 * Client-safe unaccented Vietnamese search normalizer.
 */
export function normalizeSearch(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if target text matches the search query in an accent-insensitive manner.
 */
export function matchesQuery(target: string | undefined | null, query: string): boolean {
  if (!query) return true;
  if (!target) return false;
  return normalizeSearch(target).includes(normalizeSearch(query));
}
