import type { PageServerLoad } from './$types';
import newSetData from '$data/academy-new-set.json';

export const load: PageServerLoad = async () => {
  return {
    newSet: newSetData || { wisps: [], champions: [], traits: [], augments: [] }
  };
};
