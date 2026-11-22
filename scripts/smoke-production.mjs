import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = process.argv[2] ?? 'http://127.0.0.1:4382';
const readData = (file) => JSON.parse(readFileSync(new URL(`../src/lib/data/${file}`, import.meta.url), 'utf8'));
const live = readData('academy-live.json');
const [guide] = live.comps;
const preview = readData('academy-set19.json');
const [previewGuide] = preview.comps;
const [previewChampion] = preview.learning.champions;
const previewItem = Object.values(preview.tooltips.items).find((entry) => entry.id && entry.name_vi);
const [champion] = readData('academy-new-set.json').champions;
const item = Object.values(readData('tooltip-db.json').items).find((entry) => entry.id && entry.name_vi);
assert(guide?.id && champion?.name_en && item?.id && previewGuide?.id && previewChampion?.name_en && previewItem?.id, 'Missing published smoke test samples');

async function request(path, expected = 200) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, expected, path);
  return response;
}

const home = await request('/');
const liveLabel = `Mùa ${live.set} · Bản ${live.patch}`;
assert((await home.text()).includes(liveLabel));
for (const path of ['/tierlist/comps', '/tierlist/items', '/tierlist/augments']) {
  const html = await (await request(path)).text();
  assert(html.includes(liveLabel), path);
  assert(html.includes(`href="${path}?set=${preview.set}"`), path);
  const previewHtml = await (await request(`${path}?set=${preview.set}`)).text();
  assert(previewHtml.includes(`Mùa ${preview.set} PBE`), path);
  assert(previewHtml.includes('content="noindex,follow"'), path);
}
assert((await (await request('/learn/new-set')).text()).includes(`data-tft-set="${live.set}"`));
assert((await (await request(`/learn/new-set?set=${preview.set}`)).text()).includes(`Mùa ${preview.set} PBE`));
const guideId = encodeURIComponent(guide.id);
const details = await request(`/tierlist/comps?comp=${guideId}`);
assert.match(await details.text(), /Đóng chi tiết/);
const comp = await (await request(`/api/comps/${guideId}`)).json();
assert.equal(comp.comp?.id, guide.id);
assert.equal(comp.comp?.set, live.set);
assert.deepEqual(comp.comp?.board, guide.board);
const search = await (await request(`/api/options?q=${encodeURIComponent(champion.name_en)}`)).json();
assert(search.results.some((row) => row.name_en === champion.name_en));
const tooltip = await (await request(`/api/tooltip?type=item&id=${encodeURIComponent(item.id)}`)).json();
assert.equal(tooltip.name_vi, item.name_vi);
await request('/api/explorer?patch=unknown', 400);
const previewGuideId = encodeURIComponent(previewGuide.id);
const previewDetail = await (await request(`/api/comps/${previewGuideId}?set=${preview.set}`)).json();
assert.equal(previewDetail.comp?.id, previewGuide.id);
assert.equal(previewDetail.comp?.set, preview.set);
assert.deepEqual(previewDetail.comp?.board, previewGuide.board);
const previewSearch = await (await request(`/api/options?set=${preview.set}&q=${encodeURIComponent(previewChampion.name_en)}`)).json();
assert(previewSearch.results.some((row) => row.name_en === previewChampion.name_en));
const previewTooltip = await (await request(`/api/tooltip?set=${preview.set}&type=item&id=${encodeURIComponent(previewItem.id)}`)).json();
assert.equal(previewTooltip.name_vi, previewItem.name_vi);
const sitemap = await request('/sitemap.xml');
const xml = await sitemap.text();
assert.match(xml, /<urlset/);
assert(!xml.includes(`set=${preview.set}`));
console.log(`Production smoke passed at ${origin}`);
