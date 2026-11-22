import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PREVIEW_SET, contentSet, getSeasonComp } from '$server/site-meta';

export const GET: RequestHandler = async ({ params, url }) => {
  const detail = getSeasonComp(contentSet(url), params.id) ??
    (url.searchParams.has('set') ? null : getSeasonComp(PREVIEW_SET, params.id));
  if (!detail) {
    throw error(404, 'Comp not found');
  }
  return json(detail, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600'
    }
  });
};
