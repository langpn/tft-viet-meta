import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { compSlug, getCompDetail, toCompCard } from '$lib/comp-pages';
import { getComps, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab');
  if (tab === 'items' || tab === 'item') {
    throw redirect(307, '/tierlist/items');
  }
  if (tab === 'augments' || tab === 'augment') {
    throw redirect(307, '/tierlist/augments');
  }

  const comps = getComps();
  const initialDetail = getCompDetail(comps, url.searchParams.get('comp'));

  return {
    comps: comps.map(toCompCard),
    initialCompId: initialDetail ? initialDetail.comp.id : null,
    initialComp: initialDetail ? initialDetail.comp : null,
    initialVariants: initialDetail ? initialDetail.variants : [],
    topComps: comps.slice(0, 8).map((c) => ({ title: c.title, tier: c.tier, slug: compSlug(c) })),
    meta: getSiteMeta()
  };
};
