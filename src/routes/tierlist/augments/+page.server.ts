import type { PageServerLoad } from './$types';
import augmentsData from '$data/academy-augments.json';
import { getSiteMeta } from '$server/site-meta';

export const load: PageServerLoad = async () => {
  return {
    augments: augmentsData || { silver: {}, gold: {}, prismatic: {} },
    meta: getSiteMeta()
  };
};
