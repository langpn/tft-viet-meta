// Neutral (client + server) contract for the tactics.tools explorer proxy.
// Defaults and active patch label come from meta-manifest.json; historical patches stay allowlisted.
import metaManifest from './data/meta-manifest.json' with { type: 'json' };

export const EXPLORER_HOST = 'https://d3.tft.tools';

export const DEFAULT_PATCH = String(metaManifest.explorer.patchId);
export const DEFAULT_RANK = String(metaManifest.explorer.rankGroup);

const HISTORICAL_PATCHES = [
  { value: '16212', label: 'Patch 18.5c' },
  { value: '16211', label: 'Patch 18.5b' }
] as const;

export const EXPLORER_PATCHES: ReadonlyArray<{ value: string; label: string }> = [
  { value: DEFAULT_PATCH, label: `Patch ${metaManifest.patch}` },
  ...HISTORICAL_PATCHES.filter((p) => p.value !== DEFAULT_PATCH)
];

export const EXPLORER_RANKS = [
  { value: '4', label: 'Grandmaster+' },
  { value: '0', label: 'Master+' },
  { value: '1', label: 'Diamond+' },
  { value: '2', label: 'Emerald+' },
  { value: '3', label: 'Platinum+' }
] as const;

export const EXPLORER_TIMEOUT_MS = 8000;
export const MAX_TOKEN_LENGTH = 600;
export const MAX_TOKEN_SEGMENTS = 12;
export const MAX_SEARCH_LENGTH = 100;

export type FilterType = 'u' | 'i' | 't' | 'a';

export interface ExplorerFilter {
  type: FilterType;
  id: string;
  starLevel?: number;
  tier?: number;
  pick?: number;
  userUnitId?: string;
}

// Token grammar (from the tactics.tools explorer chunk):
//   u-<unit>-<star 0-3>  t-<trait>-<tier>  i-<item>-<unit>-<star 0-3>  a-<augment>-<pick 0-2>
const ID = '[A-Za-z0-9_]{1,64}';
const TOKEN_PATTERNS = [
  new RegExp(`^u-${ID}-[0-3]$`),
  new RegExp(`^t-${ID}-\\d{1,2}$`),
  new RegExp(`^i-${ID}-${ID}-[0-3]$`),
  new RegExp(`^a-${ID}-[0-2]$`)
];

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export interface ExplorerParams {
  patch: string;
  rank: string;
  tokens: string; // '0' when no filters
}

export function parseExplorerTokens(raw: string | null | undefined): Parsed<string> {
  const text = (raw ?? '').trim();
  if (text === '' || text === '0') return { ok: true, value: '0' };
  if (text.length > MAX_TOKEN_LENGTH) return { ok: false, error: 'tokens quá dài' };
  const segments = text.split('/');
  if (segments.length > MAX_TOKEN_SEGMENTS) return { ok: false, error: 'quá nhiều bộ lọc' };
  if (!segments.every((s) => TOKEN_PATTERNS.some((p) => p.test(s)))) {
    return { ok: false, error: 'tokens không hợp lệ' };
  }
  return { ok: true, value: text };
}

/** Missing patch/rank take defaults; present-but-unknown values are rejected. */
export function parseExplorerParams(input: {
  patch?: string | null;
  rank?: string | null;
  tokens?: string | null;
}): Parsed<ExplorerParams> {
  const patch = input.patch || DEFAULT_PATCH;
  const rank = input.rank || DEFAULT_RANK;
  if (!EXPLORER_PATCHES.some((p) => p.value === patch)) return { ok: false, error: 'patch không hợp lệ' };
  if (!EXPLORER_RANKS.some((r) => r.value === rank)) return { ok: false, error: 'rank không hợp lệ' };
  const tokens = parseExplorerTokens(input.tokens);
  if (!tokens.ok) return tokens;
  return { ok: true, value: { patch, rank, tokens: tokens.value } };
}

export function buildExplorerSourceUrl(p: ExplorerParams): string {
  return `${EXPLORER_HOST}/explorer-data/${p.patch}/${p.rank}/${p.tokens}`;
}

export function buildTokenString(filters: ExplorerFilter[]): string {
  const units = filters.filter((f) => f.type === 'u');
  const firstUnit = units[0];
  const tokens = filters.map((f) => {
    if (f.type === 'u') return `u-${f.id}-${f.starLevel ?? 0}`;
    if (f.type === 'i') {
      const holder = f.userUnitId ? units.find((u) => u.id === f.userUnitId) : firstUnit;
      const unitId = f.userUnitId || firstUnit?.id;
      if (!unitId) return '';
      return `i-${f.id}-${unitId}-${holder?.starLevel ?? 0}`;
    }
    if (f.type === 't') return `t-${f.id}-${f.tier || 1}`;
    if (f.type === 'a') return `a-${f.id}-${f.pick ?? 0}`;
    return '';
  });
  return tokens.filter(Boolean).join('/') || '0';
}

/** Remove a filter; removing a unit also drops items it held (or all items if no unit is left). */
export function removeFilterAt<T extends ExplorerFilter>(filters: T[], index: number): T[] {
  const removed = filters[index];
  const rest = filters.filter((_, i) => i !== index);
  if (removed?.type !== 'u') return rest;
  const hasUnit = rest.some((f) => f.type === 'u');
  return rest.filter(
    (f) => f.type !== 'i' || (hasUnit && (f.userUnitId ? f.userUnitId !== removed.id : true))
  );
}

/** Latest-wins request slot: next() aborts the previous request and returns a fresh signal. */
export function createLatest() {
  let controller: AbortController | null = null;
  let seq = 0;
  return {
    next() {
      controller?.abort();
      controller = new AbortController();
      const id = ++seq;
      return { signal: controller.signal, isCurrent: () => id === seq };
    },
    cancel() {
      seq++;
      controller?.abort();
      controller = null;
    }
  };
}
