import type { PageServerLoad } from './$types';
import { contentSet, getContent, getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const set = contentSet(url);
  return {
    augments: getContent(set).augments,
    meta: getSiteMeta(set)
  };
};
