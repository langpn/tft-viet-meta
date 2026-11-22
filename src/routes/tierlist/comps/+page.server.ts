import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { compSlug, getCompDetail, toCompCard } from '$lib/comp-pages';
import { ARCHIVED_SET, CURRENT_SET, contentSet, getComps, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab');
  let set = contentSet(url);
  const suffix = set === ARCHIVED_SET ? `?set=${set}` : '';
  if (tab === 'items' || tab === 'item') {
    throw redirect(307, `/tierlist/items${suffix}`);
  }
  if (tab === 'augments' || tab === 'augment') {
    throw redirect(307, `/tierlist/augments${suffix}`);
  }

  const param = url.searchParams.get('comp');
  let comps = getComps(set);
  let initialDetail = getCompDetail(comps, param);
  if (param && !initialDetail && set === CURRENT_SET && !url.searchParams.has('set')) {
    const archive = getComps(ARCHIVED_SET);
    initialDetail = getCompDetail(archive, param);
    if (initialDetail) {
      comps = archive;
      set = ARCHIVED_SET;
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
