import compsData from '$data/academy-comps.json';
import itemsData from '$data/academy-items.json';
import augmentsData from '$data/academy-augments.json';
import metaManifest from '$data/meta-manifest.json';
import newSetData from '$data/academy-new-set.json';
import current from '$data/academy-set19.json';
import { buildSiteMeta } from '$lib/comp-pages';

export const CURRENT_SET = current.set;
export const ARCHIVED_SET = metaManifest.set;

export function getContent(set = CURRENT_SET) {
  return set === ARCHIVED_SET ? {
    comps: compsData, items: itemsData, augments: augmentsData, learning: newSetData,
  } : current;
}

export function getComps(set = CURRENT_SET): any[] {
  return getContent(set).comps;
}

export function getSiteMeta(set = CURRENT_SET) {
  const { comps, items, augments, learning } = getContent(set);
  return buildSiteMeta(comps, items, augments, learning);
}

export function contentSet(url: URL) {
  return url.searchParams.get('set') === String(ARCHIVED_SET) ? ARCHIVED_SET : CURRENT_SET;
}
