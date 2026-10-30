import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import compsData from '$data/academy-comps.json';
import itemsData from '$data/academy-items.json';
import augmentsData from '$data/academy-augments.json';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab');
  if (tab === 'items' || tab === 'item') {
    throw redirect(307, '/tierlist/items');
  }
  if (tab === 'augments' || tab === 'augment') {
    throw redirect(307, '/tierlist/augments');
  }

  const compParam = url.searchParams.get('comp');
  let initialComp = null;
  if (compParam) {
    const p = compParam.toLowerCase().trim();
    initialComp = (compsData || []).find((c: any) => {
      if (c.id === compParam || c.id?.toLowerCase() === p) return true;
      if (c.slug === compParam || c.slug?.toLowerCase() === p) return true;
      const titleSlug = (c.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (titleSlug === p) return true;
      const metaSlug = (c.metaTitle || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (metaSlug === p) return true;
      return false;
    }) || null;
  }

  return {
    comps: compsData || [],
    items: itemsData || { craftables: {}, radiants: {}, artifacts: {}, emblems: {} },
    augments: augmentsData || { silver: {}, gold: {}, prismatic: {} },
    initialCompId: initialComp ? initialComp.id : null
  };
};
