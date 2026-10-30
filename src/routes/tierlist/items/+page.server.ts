import type { PageServerLoad } from './$types';
import itemsData from '$data/academy-items.json';

export const load: PageServerLoad = async () => {
  return {
    items: itemsData || { craftables: {}, radiants: {}, artifacts: {}, emblems: {} }
  };
};
