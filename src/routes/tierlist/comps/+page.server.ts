import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { compSlug, toCompCard } from '$lib/comp-pages';
import { PREVIEW_SET, CURRENT_SET, contentSet, getComps, getSeasonComp, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab');
  const set = contentSet(url);
  const suffix = set === PREVIEW_SET ? `?set=${set}` : '';
  if (tab === 'items' || tab === 'item') {
    throw redirect(307, `/tierlist/items${suffix}`);
  }
  if (tab === 'augments' || tab === 'augment') {
    throw redirect(307, `/tierlist/augments${suffix}`);
  }

  const param = url.searchParams.get('comp');
  const comps = getComps(set);
  const initialDetail = getSeasonComp(set, param);
  if (param && !initialDetail && set === CURRENT_SET && !url.searchParams.has('set')) {
    if (getSeasonComp(PREVIEW_SET, param)) {
      throw redirect(307, `/tierlist/comps?comp=${encodeURIComponent(param)}&set=${PREVIEW_SET}`);
    }
  }

  return {
    comps: comps.map(toCompCard),
    initialCompId: initialDetail ? initialDetail.comp.id : null,
    initialComp: initialDetail ? initialDetail.comp : null,
    initialVariants: initialDetail ? initialDetail.variants : [],
    topComps: comps.slice(0, 8).map((c) => ({ title: c.title, tier: c.tier, slug: compSlug(c) })),
    meta: getSiteMeta(set)
  };
};
