import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchEntities } from '$lib/server/dictionary';

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || undefined;
  
  const results = searchEntities(q, {
    entityType: type as any,
    limit: 15
  });

  return json({
    query: q,
    results
  });
};
