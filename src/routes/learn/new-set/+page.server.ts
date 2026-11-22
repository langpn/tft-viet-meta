import type { PageServerLoad } from './$types';
import newSetData from '$data/academy-new-set.json';
import manifest from '$data/meta-manifest.json';

export const load: PageServerLoad = async () => {
  return {
    newSet: newSetData,
    set: manifest.set,
    setName: manifest.setName,
    patch: manifest.patch,
  };
};
