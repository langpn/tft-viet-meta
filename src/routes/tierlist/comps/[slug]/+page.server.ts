import type { PageServerLoad } from './$types';
import compsData from '$data/academy-comps.json';

export const load: PageServerLoad = async ({ params }) => {
  const comps = compsData || [];
  const foundComp = comps.find((c: any) => c.slug === params.slug || c.id === params.slug) || comps[0];

  return {
    comps,
    initialSelectedSlug: params.slug,
    foundComp
  };
};
