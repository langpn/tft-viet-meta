import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchSet18Entities } from '$lib/utils/set18-search';

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  const limit = Math.min(25, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)));
  
  const results = searchSet18Entities(q, limit);

  return json({
    query: q,
    results
  });
};
