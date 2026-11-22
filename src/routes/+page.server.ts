import type { PageServerLoad } from './$types';
import { toLandingCard } from '$lib/comp-pages';
import { getComps, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async () => {
  const comps = getComps();
  const sTierComps = comps.filter((c: any) => c.tier === 'S');
  const aTierComps = comps.filter((c: any) => c.tier === 'A').slice(0, 4);

  return {
    featuredComps: [...sTierComps, ...aTierComps].map(toLandingCard),
    totalComps: comps.length,
    meta: getSiteMeta()
  };
};
