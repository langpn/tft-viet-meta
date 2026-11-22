import compsData from '$data/academy-comps.json';
import itemsData from '$data/academy-items.json';
import augmentsData from '$data/academy-augments.json';
import metaManifest from '$data/meta-manifest.json';
import { buildSiteMeta } from '$lib/comp-pages';

export function getComps(): any[] {
  return (compsData || []) as any[];
}

export function getSiteMeta() {
  return buildSiteMeta(getComps(), itemsData, augmentsData, metaManifest);
}
