import type { PageServerLoad } from './$types';
import compsData from '$data/academy-comps.json';

export const load: PageServerLoad = async () => {
  return {
    comps: compsData || []
  };
};
