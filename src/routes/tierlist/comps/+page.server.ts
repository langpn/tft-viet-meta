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

  return {
    comps: compsData || [],
    items: itemsData || { craftables: {}, radiants: {}, artifacts: {}, emblems: {} },
    augments: augmentsData || { silver: {}, gold: {}, prismatic: {} }
  };
};
