import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseExpressionAt } from 'acorn';
import { publishFiles } from '../src/lib/server/publish-data.js';
import { fetchSource, sourceRows } from '../src/lib/server/source-fetch.js';

const academy = 'https://tftacademy.com';

function readLearningSections(code: string) {
  const datasets: Record<string, unknown>[][] = [];
  for (const match of code.matchAll(/JSON\.parse\(`\[\{/g)) {
    try {
      const start = match.index + 'JSON.parse('.length;
      const expression = parseExpressionAt(code, start, { ecmaVersion: 'latest' });
      if (expression.type !== 'TemplateLiteral' || expression.expressions.length) continue;
      const text = expression.quasis[0]?.value.cooked;
      if (!text) continue;
      const rows = JSON.parse(text);
      if (Array.isArray(rows) && rows.length && rows.every((row) => typeof row?.name === 'string')) {
        datasets.push(rows);
      }
    } catch {
      // The same chunk can contain unrelated JSON.parse calls.
    }
  }
  const champions = datasets.find((rows) => rows.every((row) => typeof row.cost === 'number' && Array.isArray(row.traits)));
  const traits = datasets.find((rows) => rows.every((row) => typeof row.type === 'string' && Array.isArray(row.breakpoints)));
  const augments = datasets.find((rows) => rows.every((row) => typeof row.tier === 'number' && typeof row.description === 'string'));
  return champions && traits && augments ? { champions, traits, augments } : null;
}

export async function captureSet19(fetchFn = fetch) {
  const get = (route: string) => fetchSource(academy + route, fetchFn);
  const routes = ['/api/tierlist/comps?set=19', '/api/tierlist/items?set=19', '/api/tierlist/augments?set=19', '/learn/new-set'] as const;
  const [comps, items, augments, page] = await Promise.all(routes.map(get));
  const sources = [comps, items, augments, page].map(({ sha256 }, index) => ({ url: academy + routes[index], sha256 }));
  const heading = page.text.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, ' ');
  if (!heading?.match(/\bSet\s+19\b/i)) throw new Error('Expected TFT Academy Set 19 learning page');
  const setName = page.text.match(/<title>TFT Set 19:\s*([^<]+)<\/title>/i)?.[1]?.trim();
  if (!setName) throw new Error('Missing TFT Academy Set 19 name');

  const read = (source: typeof comps, key: string) => {
    const rows = sourceRows(JSON.parse(source.text)[key], key);
    if (rows.some((row) => Number(row.set) !== 19)) throw new Error(`${key}: expected Set 19 rows`);
    return rows;
  };
  const guides = read(comps, 'guides');
  if (guides.some((guide) => !guide.id || !guide.title || !Array.isArray(guide.finalComp) || !guide.finalComp.length) ||
      new Set(guides.map((guide) => guide.id)).size !== guides.length) throw new Error('Incomplete Set 19 guides');
  const itemTierlists = read(items, 'items_tierlists');
  const augmentTierlists = read(augments, 'augments_tierlists');
  const hasTier = (row: Record<string, unknown>) => row.tier && Object.values(row.tier).some((entities) => Array.isArray(entities) && entities.length);
  for (const type of ['craftables', 'radiants', 'ornns', 'emblems']) {
    if (!itemTierlists.some((row) => row.type === type && hasTier(row))) throw new Error(`Missing Set 19 item category ${type}`);
  }
  for (const tier of [1, 2, 3]) {
    if (!augmentTierlists.some((row) => row.augmenttier === tier && row.stage === 'All' && hasTier(row))) throw new Error(`Missing Set 19 augment tier ${tier}`);
  }
  const nodes = new Set(`${page.headers.get('link') ?? ''}\n${page.text}`.match(/_app\/immutable\/nodes\/[\w.-]+\.js\b/g));
  for (const node of nodes) {
    const chunk = await get(`/${node}`);
    const learn = readLearningSections(chunk.text);
    if (!learn) continue;
    sources.push({ url: `${academy}/${node}`, sha256: chunk.sha256 });
    return { status: 'PREVIEW', set: 19, setName, capturedAt: new Date().toISOString(), sources, guides, itemTierlists, augmentTierlists, learn } as const;
  }
  throw new Error('Missing Set 19 learning sections');
}

if (import.meta.main) {
  try {
    const preview = await captureSet19();
    const dir = resolve(import.meta.dir, '../data/snapshots/set-19');
    mkdirSync(dir, { recursive: true });
    const path = resolve(dir, 'academy-preview.json');
    publishFiles(new Map([[path, `${JSON.stringify(preview, null, 2)}\n`]]));
    console.log(`Set 19 Academy preview: ${path} (${preview.guides.length} guides, ${preview.learn.champions.length} champions, ${preview.learn.traits.length} traits, ${preview.learn.augments.length} augments)`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
