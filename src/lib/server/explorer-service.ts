import { getChampionVi, getItemVi, getTraitVi, getAugmentVi } from './dictionary';
import {
  EXPLORER_TIMEOUT_MS,
  buildExplorerSourceUrl,
  type ExplorerParams
} from '../explorer-contract';

type Stats = { count: number; place: number; top4: number; won: number; delta?: number };

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStats = (v: unknown): v is Stats =>
  !!v && typeof v === 'object' && num((v as Stats).count) && (v as Stats).count >= 0 &&
  num((v as Stats).place) && num((v as Stats).top4) && num((v as Stats).won);
const ratio = (n: number, d: number) => (d > 0 ? n / d : 0);

function metrics(s: Stats, baseGames: number) {
  return {
    games: s.count,
    pickRate: ratio(s.count, baseGames),
    avgPlace: ratio(s.place, s.count),
    top4Rate: ratio(s.top4, s.count),
    winRate: ratio(s.won, s.count),
    delta: num(s.delta) ? s.delta : 0
  };
}

// Entries are tuples [...keys, stats]; malformed ones are dropped, never thrown on.
function rows(list: unknown, keyTypes: Array<'string' | 'number'>): Array<unknown[]> {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (e): e is unknown[] =>
      Array.isArray(e) && e.length === keyTypes.length + 1 &&
      keyTypes.every((t, i) => typeof e[i] === t) && isStats(e[keyTypes.length])
  );
}

export interface ExplorerData {
  patch: string;
  rank: string;
  sourceUrl: string;
  /** True when the source explicitly reports zero games. */
  empty: boolean;
  summary: { games: number; avgPlace: number; top4Rate: number; winRate: number };
  units: any[];
  starUnits: any[];
  items: any[];
  traits: any[];
  augments: any[];
}

export function normalizeExplorerData(raw: unknown, params: ExplorerParams): ExplorerData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError('invalid explorer payload');
  const data = raw as Record<string, unknown>;
  const base = data.base;
  if (!isStats(base)) throw new TypeError('invalid explorer base aggregate');
  const g = base.count;

  const units = rows(data.units, ['string']).map(([id, s]) => {
    const e = getChampionVi(id as string);
    return { id, nameVi: e?.name_vi || id, nameEn: e?.name_en || id, icon: e?.icon || '', cost: e?.cost || 1, ...metrics(s as Stats, g) };
  });
  const starUnits = rows(data.star_units, ['string', 'number']).map(([id, star, s]) => {
    const e = getChampionVi(id as string);
    return { id, star, nameVi: e?.name_vi || id, nameEn: e?.name_en || id, icon: e?.icon || '', cost: e?.cost || 1, ...metrics(s as Stats, g) };
  });
  const items = rows(data.items, ['string', 'string']).map(([unitId, itemId, s]) => {
    const u = getChampionVi(unitId as string);
    const i = getItemVi(itemId as string);
    const { pickRate: _p, ...m } = metrics(s as Stats, g);
    return { unitId, unitName: u?.name_vi || unitId, itemId, nameVi: i?.name_vi || itemId, nameEn: i?.name_en || itemId, icon: i?.icon || '', ...m };
  });
  const traits = rows(data.traits, ['string', 'number']).map(([id, tier, s]) => {
    const t = getTraitVi(id as string);
    return { id, tier, nameVi: t?.name_vi || id, nameEn: t?.name_en || id, icon: t?.icon || '', ...metrics(s as Stats, g) };
  });
  const augments = rows(data.augments, ['string']).map(([id, s]) => {
    const a = getAugmentVi(id as string);
    const { pickRate: _p, ...m } = metrics(s as Stats, g);
    return { id, nameVi: a?.name_vi || id, nameEn: a?.name_en || id, icon: a?.icon || '', ...m };
  });

  return {
    patch: params.patch,
    rank: params.rank,
    sourceUrl: buildExplorerSourceUrl(params),
    empty: g === 0,
    summary: { games: g, avgPlace: ratio(base.place, g), top4Rate: ratio(base.top4, g), winRate: ratio(base.won, g) },
    units, starUnits, items, traits, augments
  };
}

export type ExplorerResult =
  | { ok: true; data: ExplorerData }
  | { ok: false; status: number; error: string };

/** Fixed-host fetch with timeout; errors are generic (no upstream text/URL leaks). */
export async function fetchExplorer(
  params: ExplorerParams,
  opts: { fetch?: typeof fetch; signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<ExplorerResult> {
  const doFetch = opts.fetch ?? fetch;
  const timeout = AbortSignal.timeout(opts.timeoutMs ?? EXPLORER_TIMEOUT_MS);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
  try {
    const res = await doFetch(buildExplorerSourceUrl(params), {
      signal,
      redirect: 'error',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', Accept: 'application/json' }
    });
    if (!res.ok) {
      return res.status === 404
        ? { ok: false, status: 404, error: 'Không có dữ liệu cho bộ lọc này' }
        : { ok: false, status: 502, error: 'Nguồn dữ liệu đang lỗi' };
    }
    return { ok: true, data: normalizeExplorerData(await res.json(), params) };
  } catch {
    if (opts.signal?.aborted) return { ok: false, status: 499, error: 'Yêu cầu đã bị hủy' };
    if (timeout.aborted) return { ok: false, status: 504, error: 'Nguồn dữ liệu phản hồi quá chậm' };
    return { ok: false, status: 502, error: 'Không thể tải dữ liệu Explorer' };
  }
}
