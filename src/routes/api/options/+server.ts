import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchSet18Entities } from '$lib/utils/set18-search';
import { MAX_SEARCH_LENGTH } from '$lib/explorer-contract';

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (q.length > MAX_SEARCH_LENGTH) return json({ error: 'Từ khóa quá dài' }, { status: 400 });
  const rawLimit = url.searchParams.get('limit') ?? '';
  const limit = /^\d+$/.test(rawLimit) ? Math.min(25, Math.max(1, Number(rawLimit))) : 12;
  
  const results = searchSet18Entities(q, limit);

  return json({
    query: q,
    results
  });
};
