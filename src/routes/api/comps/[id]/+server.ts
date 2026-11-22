import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCompDetail } from '$lib/comp-pages';
import { getComps } from '$server/site-meta';

export const GET: RequestHandler = async ({ params }) => {
  const detail = getCompDetail(getComps(), params.id);
  if (!detail) {
    throw error(404, 'Comp not found');
  }
  return json(detail, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600'
    }
  });
};
