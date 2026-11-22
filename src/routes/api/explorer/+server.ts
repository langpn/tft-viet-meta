import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseExplorerParams } from '$lib/explorer-contract';
import { fetchExplorer } from '$lib/server/explorer-service';

export const GET: RequestHandler = async ({ url, fetch, request }) => {
  const parsed = parseExplorerParams({
    patch: url.searchParams.get('patch'),
    rank: url.searchParams.get('rank'),
    tokens: url.searchParams.get('tokens')
  });

  if (!parsed.ok) {
    return json({ error: parsed.error }, { status: 400 });
  }

  const result = await fetchExplorer(parsed.value, { fetch, signal: request.signal });
  if (!result.ok) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(result.data);
};
