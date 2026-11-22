import newSetData from '$data/academy-new-set.json';
import previousComps from '$data/academy-comps.json';
import live from '$data/academy-live.json';
import preview from '$data/academy-set19.json';
import { buildSiteMeta, findComp, getCompDetail } from '$lib/comp-pages';

export const CURRENT_SET = live.set;
export const PREVIEW_SET = preview.set;

export function getContent(set = CURRENT_SET) {
  return set === PREVIEW_SET ? preview : { ...live, learning: newSetData };
}

export function getComps(set = CURRENT_SET): any[] {
  return getContent(set).comps;
}

export function getSeasonComp(set: number, id: string | null) {
  const comps = getComps(set);
  return getCompDetail(comps, id) ?? (set === CURRENT_SET ? getCompDetail(comps, findComp(previousComps, id)?.id) : null);
}

export function getSiteMeta(set = CURRENT_SET) {
  const { comps, items, augments, learning } = getContent(set);
  return buildSiteMeta(comps, items, augments, { set, patch: set === CURRENT_SET ? live.patch : learning.patch });
}

export function contentSet(url: URL) {
  return url.searchParams.get('set') === String(PREVIEW_SET) ? PREVIEW_SET : CURRENT_SET;
}
