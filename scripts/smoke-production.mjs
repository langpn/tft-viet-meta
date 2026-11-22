import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = process.argv[2] ?? 'http://127.0.0.1:4382';
const readData = (file) => JSON.parse(readFileSync(new URL(`../src/lib/data/${file}`, import.meta.url), 'utf8'));
const [guide] = readData('academy-comps.json');
const current = readData('academy-set19.json');
const [currentGuide] = current.comps;
const [currentChampion] = current.learning.champions;
const currentItem = Object.values(current.tooltips.items).find((entry) => entry.id && entry.name_vi);
const [champion] = readData('academy-new-set.json').champions;
const item = Object.values(readData('tooltip-db.json').items).find((entry) => entry.id && entry.name_vi);
assert(guide?.id && champion?.name_en && item?.id && currentGuide?.id && currentChampion?.name_en && currentItem?.id, 'Missing published smoke test samples');

async function request(path, expected = 200) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, expected, path);
  return response;
}

const home = await request('/');
assert.match(await home.text(), new RegExp(`Mùa ${current.set}`));
const guides = await request('/tierlist/comps');
assert.match(await guides.text(), /tierlist\/comps/);
const guideId = encodeURIComponent(guide.id);
const details = await request(`/tierlist/comps?comp=${guideId}`);
assert.match(await details.text(), /Đóng chi tiết/);
const comp = await (await request(`/api/comps/${guideId}`)).json();
assert.equal(comp.comp?.id, guide.id);
assert(comp.comp.board?.length > 0);
const search = await (await request(`/api/options?q=${encodeURIComponent(champion.name_en)}`)).json();
assert(search.results.some((row) => row.name_en === champion.name_en));
const tooltip = await (await request(`/api/tooltip?type=item&id=${encodeURIComponent(item.id)}`)).json();
assert.equal(tooltip.name_vi, item.name_vi);
await request('/api/explorer?patch=unknown', 400);
for (const path of ['/tierlist/items', '/tierlist/augments', '/learn/new-set']) {
  assert.match(await (await request(path)).text(), new RegExp(`(?:Mùa|Set) ${current.set}`));
}
const currentGuideId = encodeURIComponent(currentGuide.id);
const currentDetail = await (await request(`/api/comps/${currentGuideId}?set=${current.set}`)).json();
assert.equal(currentDetail.comp?.id, currentGuide.id);
assert.equal(currentDetail.comp?.set, current.set);
assert.deepEqual(currentDetail.comp?.board.map(({ id }) => id), currentGuide.board.map(({ id }) => id));
const currentSearch = await (await request(`/api/options?set=${current.set}&q=${encodeURIComponent(currentChampion.name_en)}`)).json();
assert(currentSearch.results.some((row) => row.name_en === currentChampion.name_en));
const currentTooltip = await (await request(`/api/tooltip?set=${current.set}&type=item&id=${encodeURIComponent(currentItem.id)}`)).json();
assert.equal(currentTooltip.name_vi, currentItem.name_vi);
const sitemap = await request('/sitemap.xml');
assert.match(await sitemap.text(), /<urlset/);
console.log(`Production smoke passed at ${origin}`);
