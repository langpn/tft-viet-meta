import type { PageServerLoad } from './$types';
import { DEFAULT_PATCH, DEFAULT_RANK, parseExplorerParams } from '$lib/explorer-contract';
import { fetchExplorer } from '$lib/server/explorer-service';
import manifest from '$data/meta-manifest.json';

const VALID_TABS = new Set(['units', 'traits', 'items', 'augments']);

export const load: PageServerLoad = async ({ fetch, url }) => {
  const tabParam = url.searchParams.get('tab') || '';
  const initialTab = VALID_TABS.has(tabParam) ? tabParam : 'units';

  const parsed = parseExplorerParams({
    patch: url.searchParams.get('patch'),
    rank: url.searchParams.get('rank'),
  });

  if (!parsed.ok) {
    return {
      initialData: null,
      initialError: parsed.error,
      initialPatch: DEFAULT_PATCH,
      initialRank: DEFAULT_RANK,
      set: manifest.set,
      initialTab
    };
  }

  const result = await fetchExplorer(parsed.value, { fetch });
  return {
    initialData: result.ok ? result.data : null,
    initialError: result.ok ? null : result.error,
    initialPatch: parsed.value.patch,
    initialRank: parsed.value.rank,
    set: manifest.set,
    initialTab
  };
};
