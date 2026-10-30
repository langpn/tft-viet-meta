import type { PageServerLoad } from './$types';
import itemsData from '$data/academy-items.json';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab') || url.searchParams.get('category');
  const validTabs = ['craftables', 'radiants', 'artifacts', 'emblems'];
  const initialCategory = validTabs.includes(tab as any) ? tab : 'craftables';

  return {
    items: itemsData || { craftables: {}, radiants: {}, artifacts: {}, emblems: {} },
    initialCategory
  };
};
