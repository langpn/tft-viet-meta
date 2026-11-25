import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import previousComps from '../src/lib/data/academy-comps.json';
import learning from '../src/lib/data/academy-new-set.json';
import { parseAugments, parseComps, parseItems } from '../src/lib/server/academy-sync.js';
import { applyCoachingTranslations, type CoachingGuide } from '../src/lib/server/coaching-localization.js';
import { publishFiles } from '../src/lib/server/publish-data.js';
import { fetchSource, sourceRows } from '../src/lib/server/source-fetch.js';
import { latestTierlists } from './build-academy-set19.js';
import { generateLlmsText } from './generate-llms-txt.js';

const origin = 'https://tftacademy.com';
const set = learning.set;
const endpoints = [
  '/tierlist/comps',
  `/api/tierlist/comps?set=${set}`,
  `/api/tierlist/items?set=${set}`,
  `/api/tierlist/augments?set=${set}`,
];

export function liveAcademyPatch(html: string) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
  const match = title.match(/\bSet (\d+) \(Patch (\d+\.\d+[a-z]?)\)/i);
  assert(match && Number(match[1]) === set && match[2].startsWith(`${set}.`),
    `Expected the official TFT Academy Set ${set} tier list, got ${title || 'no title'}`);
  return match[2];
}

export async function buildAcademyLive(fetchFn = fetch) {
  const [page, ...data] = await Promise.all(endpoints.map((path) => fetchSource(origin + path, fetchFn)));
  const patch = liveAcademyPatch(page.text);
  const [guides, itemTiers, augmentTiers] = ['guides', 'items_tierlists', 'augments_tierlists'].map((key, index) => {
    const rows = sourceRows(JSON.parse(data[index].text)[key], endpoints[index + 1]);
    assert(rows.every((row) => row.set === set), `Unexpected set in TFT Academy ${key}`);
    return rows;
  });
  assert(guides.every((row) => typeof row.id === 'string' && row.id && typeof row.title === 'string' && row.title.trim() &&
    ['S', 'A', 'B', 'C', 'X'].includes(row.tier) && Array.isArray(row.finalComp) && row.finalComp.length &&
    row.finalComp.every((unit) => typeof unit?.apiName === 'string' && unit.apiName && Number.isInteger(unit.boardIndex))),
  'Incomplete live TFT Academy comp guide');
  guides.sort((a, b) => a.displayIndex - b.displayIndex || a.id.localeCompare(b.id));
  const comps = parseComps(guides).map((comp) => ({ ...comp, set }));
  for (const comp of comps) comp.tips = comp.tips.filter((tip) => tip.tip.trim());
  const coachingPath = resolve('coaching-live-translations.json');
  const reviewed: CoachingGuide[] = existsSync(coachingPath)
    ? JSON.parse(readFileSync(coachingPath, 'utf8'))
    : [];
  const englishCoaching = applyCoachingTranslations(comps, previousComps, reviewed, true);
  return {
    set, patch, updatedAt: new Date().toISOString(),
    sources: [page, ...data].map(({ sha256 }, index) => ({ url: origin + endpoints[index], sha256 })),
    comps,
    items: parseItems(latestTierlists(itemTiers, (row) => row.type)),
    augments: parseAugments(latestTierlists(augmentTiers, (row) => `${row.augmenttier}/${row.stage}`)),
    englishCoaching,
  };
}

export function verifyAcademyLive(snapshot: Awaited<ReturnType<typeof buildAcademyLive>>) {
  const { set: snapshotSet, patch, updatedAt, sources, comps, items, augments, englishCoaching } = snapshot;
  assert(snapshotSet === set && new RegExp(`^${set}\\.\\d+[a-z]?$`).test(patch) && Number.isFinite(Date.parse(updatedAt)));
  assert.deepEqual(sources.map(({ url }) => url), endpoints.map((path) => origin + path));
  assert(sources.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)));
  assert(comps.length && new Set(comps.map(({ id }) => id)).size === comps.length);
  assert(comps.every((comp) => comp.set === set && comp.title && comp.board.length));
  for (const category of Object.values(items.categories)) assert(Object.values(category).some((rows) => rows.length));
  for (const category of Object.values(augments.stages)) {
    for (const stage of ['All', '2-1', '3-2', '4-2']) assert(Object.values(category[stage] ?? {}).some((rows) => rows.length));
  }
  return { set, patch, comps: comps.length, englishCoaching, sources: sources.length };
}

function content(snapshot: Awaited<ReturnType<typeof buildAcademyLive>>) {
  const { updatedAt: _date, sources: _sources, items, augments, ...rest } = snapshot;
  const { updatedAt: _itemsDate, ...itemTiers } = items;
  const { updatedAt: _augmentsDate, ...augmentTiers } = augments;
  return JSON.stringify({ ...rest, items: itemTiers, augments: augmentTiers });
}

if (import.meta.main) {
  try {
    const snapshot = await buildAcademyLive();
    const result = verifyAcademyLive(snapshot);
    const path = resolve('src/lib/data/academy-live.json');
    const { llms, full } = generateLlmsText(snapshot.comps, { ...learning, patch: snapshot.patch });
    const files = new Map<string, string>();
    for (const [file, value] of [['static/llms.txt', llms], ['static/llms-full.txt', full]]) {
      if (!existsSync(file) || readFileSync(file, 'utf8') !== value) files.set(resolve(file), value);
    }
    const previous = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
    if (!previous || content(previous) !== content(snapshot)) files.set(path, `${JSON.stringify(snapshot)}\n`);
    publishFiles(files);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
