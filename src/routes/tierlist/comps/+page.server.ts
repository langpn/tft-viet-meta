import type { PageServerLoad } from './$types';
import compsData from '$data/academy-comps.json';
import itemsData from '$data/academy-items.json';
import augmentsData from '$data/academy-augments.json';

export const load: PageServerLoad = async () => {
  return {
    comps: compsData || [],
    items: itemsData || { craftables: {}, radiants: {}, artifacts: {}, emblems: {} },
    augments: augmentsData || { silver: {}, gold: {}, prismatic: {} }
  };
};
