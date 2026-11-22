/**
 * Builds a Vietnamese translation overlay from two sources:
 *   1. CommunityDragon cdragon/tft/vi_vn.json  — Riot's own Vietnamese strings
 *   2. data.metatft.com lookups/TFTSet18_latest_vi_vn.json — Vietnamese descriptions
 *      (Riot's item descriptions in cdragon are null; metatft carries them)
 *
 * Output: official-vi.json in the staging directory, keyed by Riot apiName.
 * Never invents a translation: an id missing from both sources stays absent.
 */
import fs from 'node:fs';
import path from 'node:path';
import manifest from '../src/lib/data/meta-manifest.json';
import { fetchSource, sourceRows } from '../src/lib/server/source-fetch.js';
import { publishFiles } from '../src/lib/server/publish-data.js';

const target = process.argv[2];
if (!target || fs.realpathSync(target) === fs.realpathSync(path.resolve(import.meta.dir, '../src/lib/data'))) {
  throw new Error('Usage: bun scripts/build-official-vi.ts <staging-data-dir>');
}
const RIOT_URL = `https://raw.communitydragon.org/${manifest.communityDragonRelease}/cdragon/tft/vi_vn.json`;
const METATFT_URL = `https://data.metatft.com/lookups/TFTSet${manifest.set}_latest_vi_vn.json`;

type Entry = { name_vi?: string; desc_vi?: string; ability_vi?: string };

const out: Record<string, Entry> = Object.create(null);
let fromRiot = 0;
let fromMeta = 0;

const put = (id: string, field: keyof Entry, value?: string | null, source?: 'riot' | 'meta') => {
  const v = (value || '').trim();
  if (!id || !v) return;
  out[id] ??= {};
  if (out[id][field]) return; // first writer wins; Riot is written first
  out[id][field] = v;
  if (source === 'riot') fromRiot++;
  else if (source === 'meta') fromMeta++;
};

// ---------- 1. Riot cdragon ----------
console.log('Fetching Riot cdragon vi_vn...');
const riot = JSON.parse((await fetchSource(RIOT_URL)).text);

for (const item of sourceRows(riot.items, RIOT_URL)) {
  if (!item?.apiName) continue;
  put(item.apiName, 'name_vi', item.name, 'riot');
  put(item.apiName, 'desc_vi', item.desc, 'riot');
}

const set18 = (riot.setData || []).find((s: any) => s.mutator === `TFTSet${manifest.set}`);
if (!set18) throw new Error(`TFTSet${manifest.set} not found in CommunityDragon`);

for (const c of set18.champions || []) {
  if (!c?.apiName) continue;
  put(c.apiName, 'name_vi', c.name, 'riot');
  put(c.apiName, 'ability_vi', c.ability?.name, 'riot');
}
for (const t of set18.traits || []) {
  if (!t?.apiName) continue;
  put(t.apiName, 'name_vi', t.name, 'riot');
  put(t.apiName, 'desc_vi', t.desc, 'riot');
}

// ---------- 2. metatft vi_vn (fill descriptions Riot leaves null) ----------
console.log('Fetching metatft vi_vn lookups...');
const meta = JSON.parse((await fetchSource(METATFT_URL)).text);

for (const it of meta.items || []) {
  if (!it?.apiName) continue;
  put(it.apiName, 'name_vi', it.name, 'meta');
  put(it.apiName, 'desc_vi', it.desc, 'meta');
}
for (const a of meta.augments || []) {
  if (!a?.apiName) continue;
  put(a.apiName, 'name_vi', a.name, 'meta');
  put(a.apiName, 'desc_vi', a.desc, 'meta');
}
for (const u of meta.units || []) {
  if (!u?.apiName) continue;
  put(u.apiName, 'name_vi', u.name, 'meta');
  put(u.apiName, 'ability_vi', u.ability?.name, 'meta');
  put(u.apiName, 'desc_vi', u.ability?.desc, 'meta');
}
for (const t of meta.traits || []) {
  if (!t?.apiName) continue;
  put(t.apiName, 'name_vi', t.name, 'meta');
  put(t.apiName, 'desc_vi', t.desc, 'meta');
}

const dest = path.join(target, 'official-vi.json');
publishFiles(new Map([[dest, JSON.stringify(out, null, 2)]]));

const withName = Object.values(out).filter(e => e.name_vi).length;
const withDesc = Object.values(out).filter(e => e.desc_vi).length;
console.log(`Saved ${Object.keys(out).length} ids -> ${dest}`);
console.log(`  with name_vi: ${withName} | with desc_vi: ${withDesc}`);
console.log(`  writes from riot: ${fromRiot} | from metatft: ${fromMeta}`);
