import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseAugments, parseComps, parseItems, type Set18Info } from '../src/lib/server/academy-sync.js';
import { publishFiles } from '../src/lib/server/publish-data.js';
import { fetchSource, sourceRows } from '../src/lib/server/source-fetch.js';
import { captureSet19 } from './stage-set19.js';
import { generateLlmsText } from './generate-llms-txt.js';

const groups = ['champions', 'items', 'augments', 'traits'] as const;
const assetUrls = groups.map((group) => `https://tftacademy.com/api/assets/${group}?set=19`);
const localeUrl = 'https://data.metatft.com/lookups/TFTSet19_latest_vi_vn.json';
type Group = typeof groups[number];
type Row = Record<string, any>;

const text = (value: unknown) => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';
const icon = (kind: Group, id: string) => `https://assets.tftacademy.com/${kind}/${kind === 'champions' ? 'champion_icons/' : ''}${encodeURIComponent(id)}.webp`;
const academyName = (value: unknown) => text(value).replaceAll('|', '/').replaceAll('PiÃ±ata', 'Piñata').toLowerCase();

function latestTierlists(rows: Row[], key: (row: Row) => string): Row[] {
  const latest = new Map<string, Row>();
  for (const row of rows) {
    if (!Object.values(row.tier ?? {}).some((entries) => Array.isArray(entries) && entries.length)) continue;
    const previous = latest.get(key(row));
    if (!previous || String(row.updated ?? '') > String(previous.updated ?? '')) latest.set(key(row), row);
  }
  return [...latest.values()];
}

export async function buildAcademySet19(fetchFn = fetch) {
  const [preview, locale, ...assets] = await Promise.all([
    captureSet19(fetchFn),
    fetchSource(localeUrl, fetchFn),
    ...assetUrls.map((url) => fetchSource(url, fetchFn)),
  ]);
  const localeData = JSON.parse(locale.text);
  const lookup = (rows: Row[]) => new Map(rows.filter((row) => typeof row.apiName === 'string').map((row) => [row.apiName as string, row]));
  const english = new Map(groups.map((group, i) => {
    const rows = sourceRows(JSON.parse(assets[i].text)[group], group);
    assert(rows.every((row) => Number(row.set) === 19 && typeof row.apiName === 'string' && typeof row.name === 'string'), `Invalid Academy Set 19 ${group}`);
    assert.equal(new Set(rows.map((row) => row.apiName)).size, rows.length, `Duplicate Academy Set 19 ${group} IDs`);
    return [group, lookup(rows)] as const;
  }));
  const vietnamese = new Map(groups.map((group) => {
    const rows = localeData[group === 'champions' ? 'units' : group];
    assert(rows && typeof rows === 'object', `Missing MetaTFT Set 19 ${group}`);
    return [group, lookup(Object.values(rows))] as const;
  }));
  const entity = (group: Group, id: string) => {
    const en = english.get(group)?.get(id);
    const vi = vietnamese.get(group)?.get(id);
    return {
      id,
      name_en: text(en?.name) || text(vi?.en_name) || id,
      name_vi: text(vi?.name),
      desc_en: text(en?.description) || text(vi?.en_desc),
      desc_vi: text(vi?.desc),
      icon: icon(group, id),
    };
  };
  const item = (id: string) => entity('items', id);
  const augment = (id: string) => entity('augments', id);
  const trait = (id: string) => entity('traits', id);
  const champion = (id: string, fallbackCost = 1) => {
    const en = english.get('champions')?.get(id);
    const vi = vietnamese.get('champions')?.get(id);
    return {
      ...entity('champions', id),
      cost: en?.cost ?? vi?.cost ?? fallbackCost,
      traits: Object.keys(en?.traitContributions ?? {}),
      abilityName: text(en?.abilityName),
      abilityNameVi: text(vi?.ability?.name),
      abilityMana: en?.stats?.mana == null ? '' : `${en.stats.manaStart ?? 0}/${en.stats.mana}`,
      ability: text(en?.ability),
      desc_vi: text(vi?.ability?.desc),
    };
  };

  // The upstream list includes earlier records and unpublished empty tiers.
  const sortedGuides = [...preview.guides].sort((a, b) => Number(a.displayIndex ?? 0) - Number(b.displayIndex ?? 0));
  const comps = parseComps(sortedGuides, { champion, item, augment }).map((comp) => {
    const counts = new Map<string, number>();
    for (const id of new Set(comp.board.map((unit) => unit.id))) {
      const contributions = english.get('champions')?.get(id)?.traitContributions ?? {};
      for (const [traitId, count] of Object.entries(contributions)) {
        if (typeof count === 'number') counts.set(traitId, (counts.get(traitId) ?? 0) + count);
      }
    }
    const traits = [...counts].flatMap(([id, count]) => {
      const en = english.get('traits')?.get(id);
      const threshold = (en?.breakpoints as number[] | undefined)?.findLastIndex((n) => n > 0 && n <= count) ?? -1;
      if (threshold < 0) return [];
      const color = en?.colors?.[threshold] ?? 1;
      const tier = color >= 6 ? 'prismatic' : color >= 4 ? 'gold' : color >= 2 ? 'silver' : 'bronze';
      return [{ ...trait(id), tier, count }];
    });
    return { ...comp, set: preview.set, traits, tips: comp.tips.filter((tip) => tip.tip.trim()) };
  });
  const items = parseItems(latestTierlists(preview.itemTierlists, (row) => row.type), item);
  const augments = parseAugments(latestTierlists(preview.augmentTierlists, (row) => `${row.augmenttier}/${row.stage}`), augment);
  const learningChampionNames = new Set(preview.learn.champions.map((row) => row.name));
  const learningTraitNames = new Set(preview.learn.traits.map((row) => row.name));
  const champions = [...english.get('champions')!.values()].filter((row) => learningChampionNames.has(row.name)).map(({ apiName }) => {
    const entry = champion(apiName);
    return { ...entry, traits: entry.traits.map(trait) };
  });
  const allTraits = [...english.get('traits')!.values()].map((row) => ({
    ...trait(row.apiName), type: row.type, breakpoints: row.breakpoints ?? [], colors: row.colors ?? [], effects: (row.effects ?? []).map(text),
  }));
  const traitNames = new Set([...learningTraitNames].map(academyName));
  const traits = allTraits.filter((row) => traitNames.has(academyName(row.name_en)));
  const sourceAugments = new Map([...english.get('augments')!.values()].map((row) => [`${row.tier}/${academyName(row.name)}`, row]));
  const learningAugments = preview.learn.augments.map((row) => {
    const tier = Number(row.tier);
    const match = sourceAugments.get(`${tier}/${academyName(row.name)}`);
    const entry = match ? augment(match.apiName) : {
      id: '', name_en: text(row.name), name_vi: '', desc_en: text(row.description), desc_vi: '', icon: '',
    };
    return { ...entry, tier, tierName: (['Silver', 'Gold', 'Prismatic'] as const)[tier - 1] };
  });
  const learning: Set18Info = {
    set: preview.set, setName: preview.setName, patch: '', updatedAt: preview.capturedAt,
    mechanic: { title: '', summary: '', description: '', rules: [] }, wisps: [],
    champions, traits, augments: learningAugments,
  };
  const tooltips = {
    champions: Object.fromEntries([...english.get('champions')!.values()].map((row) => {
      const entry = champion(row.apiName);
      return [entry.id, { ...entry, set: preview.set, traits: entry.traits.map(trait), role_en: row.role, stats: row.stats,
        ability: { name_en: entry.abilityName, name_vi: entry.abilityNameVi, desc_en: entry.ability, desc_vi: entry.desc_vi, mana: entry.abilityMana } }];
    })),
    items: Object.fromEntries([...english.get('items')!.values()].map((row) => [row.apiName, { ...item(row.apiName), stats: row.stats }])),
    augments: Object.fromEntries([...english.get('augments')!.values()].map((row) => [row.apiName, { ...augment(row.apiName), tier: row.tier }])),
    traits: Object.fromEntries(allTraits.map((row) => [row.id, row])),
  };
  for (const group of [...Object.values(items.categories), augments.silver, augments.gold, augments.prismatic]) {
    assert(Object.values(group).some((rows) => rows.length > 0), 'Empty Academy Set 19 tier list');
  }
  assert(champions.length && traits.length && learningAugments.length, 'Missing Academy Set 19 learning records');
  const sources = [...preview.sources, ...assets.map((source, i) => ({ url: assetUrls[i], sha256: source.sha256 })), { url: localeUrl, sha256: locale.sha256 }];
  return { set: preview.set, setName: preview.setName, capturedAt: preview.capturedAt, sources, comps, items, augments, learning, tooltips };
}

export function verifyAcademySet19(snapshot: Awaited<ReturnType<typeof buildAcademySet19>>) {
  const { set, setName, capturedAt, sources, comps, items, augments, learning, tooltips } = snapshot;
  assert(set === 19 && setName && Number.isFinite(Date.parse(capturedAt)));
  assert.equal(learning.set, set);
  assert.equal(learning.setName, setName);
  assert(sources.length >= 10 && sources.every((source) => /^https:\/\//.test(source.url) && /^[a-f0-9]{64}$/.test(source.sha256)));
  assert(comps.length && new Set(comps.map(({ id }) => id)).size === comps.length);
  for (const comp of comps) {
    assert(comp.set === set && comp.title && comp.board.length, `Invalid Academy guide ${comp.id}`);
    for (const unit of comp.board) {
      assert(Object.hasOwn(tooltips.champions, unit.id) && Number.isInteger(unit.boardIndex), `Invalid unit ${unit.id} in ${comp.id}`);
      assert(unit.items.every(({ id }) => Object.hasOwn(tooltips.items, id)), `Unknown item on ${unit.id} in ${comp.id}`);
    }
  }
  for (const group of [items.craftables, items.radiants, items.artifacts, items.emblems]) {
    const rows = Object.values(group).flat();
    assert(rows.length && rows.every(({ id }) => Object.hasOwn(tooltips.items, id)), 'Missing Academy item records');
  }
  for (const group of [augments.silver, augments.gold, augments.prismatic]) {
    const rows = Object.values(group).flat();
    assert(rows.length && rows.every(({ id }) => Object.hasOwn(tooltips.augments, id)), 'Missing Academy augment records');
  }
  assert(learning.champions.length && learning.traits.length && learning.augments.length && !learning.wisps.length);
  return { set, comps: comps.length, champions: learning.champions.length, traits: learning.traits.length, augments: learning.augments.length, sources: sources.length };
}

function content(snapshot: Awaited<ReturnType<typeof buildAcademySet19>>) {
  const { capturedAt: _capture, sources: _sources, items, augments, learning, ...rest } = snapshot;
  const { updatedAt: _itemsDate, ...itemTiers } = items;
  const { updatedAt: _augmentDate, ...augmentTiers } = augments;
  const { updatedAt: _learnDate, ...learnContent } = learning;
  return JSON.stringify({ ...rest, items: itemTiers, augments: augmentTiers, learning: learnContent });
}

if (import.meta.main) {
  try {
    const snapshot = await buildAcademySet19();
    const path = resolve(import.meta.dir, '../src/lib/data/academy-set19.json');
    const result = verifyAcademySet19(snapshot);
    const previous = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
    const files = new Map<string, string>();
    if (!previous || content(previous) !== content(snapshot)) files.set(path, `${JSON.stringify(snapshot)}\n`);
    const { llms, full } = generateLlmsText(snapshot.comps, snapshot.learning);
    for (const [file, value] of [['static/llms.txt', llms], ['static/llms-full.txt', full]]) {
      const target = resolve(import.meta.dir, '..', file);
      if (!existsSync(target) || readFileSync(target, 'utf8') !== value) files.set(target, value);
    }
    publishFiles(files);
    console.log(JSON.stringify({ ...result, changedFiles: files.size }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
