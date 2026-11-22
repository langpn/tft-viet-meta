import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createEntitySearch, searchSet18Entities } from '$lib/utils/set18-search';
import { MAX_SEARCH_LENGTH } from '$lib/explorer-contract';
import current from '$data/academy-set19.json';

const searchCurrent = createEntitySearch([
  ...current.learning.champions.map((entity) => ({ ...entity, entityType: 'unit' as const })),
  ...Object.values(current.tooltips.items).map((entity) => ({ ...entity, entityType: 'item' as const })),
  ...current.learning.augments.map((entity) => ({ ...entity, entityType: 'augment' as const })),
  ...current.learning.traits.map((entity) => ({ ...entity, entityType: 'trait' as const })),
].filter(({ id }) => id).map(({ id, name_vi, name_en, icon, entityType }) => ({ id, name_vi, name_en, icon, entityType })));

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (q.length > MAX_SEARCH_LENGTH) return json({ error: 'Từ khóa quá dài' }, { status: 400 });
  const rawLimit = url.searchParams.get('limit') ?? '';
  const limit = /^\d+$/.test(rawLimit) ? Math.min(25, Math.max(1, Number(rawLimit))) : 12;
  
  const search = url.searchParams.get('set') === String(current.set) ? searchCurrent : searchSet18Entities;
  const results = search(q, limit);

  return json({
    query: q,
    results
  });
};
