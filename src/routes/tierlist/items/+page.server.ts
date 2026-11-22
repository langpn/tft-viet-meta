import type { PageServerLoad } from './$types';
import { contentSet, getContent, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab') || url.searchParams.get('category');
  const validTabs = ['craftables', 'radiants', 'artifacts', 'emblems'];
  const initialCategory = validTabs.includes(tab as any) ? tab : 'craftables';
  const set = contentSet(url);

  return {
    items: getContent(set).items,
    initialCategory,
    meta: getSiteMeta(set)
  };
};
