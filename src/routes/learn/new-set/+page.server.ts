import type { PageServerLoad } from './$types';
import { contentSet, getContent } from '$server/site-meta';

export const load: PageServerLoad = async ({ url }) => {
  const { learning } = getContent(contentSet(url));
  return {
    newSet: learning,
    set: learning.set,
    setName: learning.setName,
    patch: learning.patch,
  };
};
