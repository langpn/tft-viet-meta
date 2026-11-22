import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import manifest from '../src/lib/data/meta-manifest.json';
import fixture from '../tests/fixtures/explorer-parity.json';
import { buildTokenString, parseExplorerParams } from '../src/lib/explorer-contract.js';
import { normalizeExplorerData } from '../src/lib/server/explorer-service.js';
import { sha256 } from '../src/lib/server/source-fetch.js';

export function verifyExplorerParity(patch = manifest.explorer.patchId, rank = manifest.explorer.rankGroup) {
  assert(fixture.samples.some(({ params }) => params.patch === patch && params.rank === String(rank) && params.tokens === '0'),
    `Missing Explorer baseline fixture for ${patch}/${rank}`);
  for (const sample of fixture.samples) {
    const tokens = sample.filter ? buildTokenString([{ type: 'u', id: sample.filter.unit, starLevel: sample.filter.star }]) : sample.params.tokens;
    const params = parseExplorerParams({ ...sample.params, tokens });
    assert(params.ok);
    const local = normalizeExplorerData(sample.raw, params.value);
    assert.equal(local.sourceUrl, sample.url);
    assert.deepEqual(local.summary, sample.summary);
    if (sample.item) {
      const item = local.items.find((row) => row.unitId === sample.item.unitId && row.itemId === sample.item.itemId);
      assert(item, `Missing sample item in ${sample.url}`);
      for (const [field, value] of Object.entries(sample.item)) assert.equal(item[field], value, `${sample.url} ${field}`);
    }
  }
  return fixture.samples.length;
}

export function verifyMetaFiles(files: Record<string, string>, read: (path: string) => Uint8Array) {
  const expected = Object.keys(manifest.files).sort();
  assert.deepEqual(Object.keys(files).sort(), expected, 'Manifest files differ from the required dataset list');
  for (const [file, hash] of Object.entries(files)) assert.equal(sha256(read(file)), hash, `${file} differs from the manifest`);
  return expected.length;
}

export function verifyCandidateMeta(read: (file: string) => Uint8Array) {
  const datasets = new Map(Object.keys(manifest.files).map((file) => [file.split('/').at(-1), JSON.parse(Buffer.from(read(file)).toString('utf8'))]));
  const record = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
  const nonEmptyRows = (value: unknown): value is Record<string, unknown>[] =>
    Array.isArray(value) && value.length > 0 && value.every(record);
  const comps = datasets.get('academy-comps.json');
  assert(nonEmptyRows(comps) && comps.every((c) => typeof c.id === 'string' && c.id && nonEmptyRows(c.board)), 'Invalid comp guides');
  assert.equal(new Set(comps.map((c) => c.id)).size, comps.length, 'Duplicate comp guides');
  const items = datasets.get('academy-items.json');
  const augments = datasets.get('academy-augments.json');
  const hasTiers = (group: unknown) => record(group) && Object.values(group).some(nonEmptyRows);
  for (const category of ['craftables', 'radiants', 'artifacts', 'emblems']) {
    assert(hasTiers(items?.categories?.[category]) && hasTiers(items?.[category]), `Missing item tiers: ${category}`);
  }
  for (const category of ['silver', 'gold', 'prismatic']) assert(hasTiers(augments?.[category]), `Missing augment tiers: ${category}`);
  const newSet = datasets.get('academy-new-set.json');
  assert(newSet?.set === manifest.set && newSet?.patch === manifest.patch, 'New-set metadata differs from the manifest');
  for (const section of ['wisps', 'champions', 'traits', 'augments']) assert(nonEmptyRows(newSet[section]), `Missing new-set section: ${section}`);
  for (const file of ['tooltip-db.json', 'canonical-dictionary.json']) {
    for (const group of ['champions', 'items', 'augments', 'traits']) assert(record(datasets.get(file)?.[group]), `Missing ${file} group: ${group}`);
  }
  for (const file of ['official-vi.json', 'champion-hex-index.json']) assert(record(datasets.get(file)), `Missing content: ${file}`);
}

export function verifyPublishedMeta() {
  const read = (file: string) => readFileSync(resolve(file));
  const files = verifyMetaFiles(manifest.files, read);
  verifyCandidateMeta(read);
  return {
    status: 'PASS',
    set: manifest.set,
    patch: manifest.patch,
    files,
    explorerFixtures: verifyExplorerParity(),
  };
}

if (import.meta.main) {
  try {
    console.log(JSON.stringify(verifyPublishedMeta(), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
