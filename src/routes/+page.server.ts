import type { PageServerLoad } from './$types';
import compsData from '$data/academy-comps.json';

export const load: PageServerLoad = async () => {
  const comps = compsData || [];
  const sTierComps = comps.filter((c: any) => c.tier === 'S');
  const aTierComps = comps.filter((c: any) => c.tier === 'A').slice(0, 4);

  return {
    featuredComps: [...sTierComps, ...aTierComps],
    totalComps: comps.length
  };
};
