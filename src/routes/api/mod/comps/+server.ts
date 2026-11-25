import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import live from '$data/academy-live.json';
import { buildModPayload } from '$lib/server/mod-export';

/**
 * GET /api/mod/comps
 * Mod-facing snapshot of the live Academy meta, in the vocabulary the TFT mod dylib reads:
 * - comps: 74 guides with slug/tier/board hex/curve (early-mid-final, items per unit)/augments/carousel
 * - itemPriority: ordered substitute item ids per kind (ad/ap/tank/utility) from Academy tierlist
 * - augmentFallback: ordered augment ids from the Academy stage tierlists
 */
export const GET: RequestHandler = async () => {
  const payload = buildModPayload(live as unknown as Record<string, unknown>);
  return json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=900, s-maxage=3600'
    }
  });
};
