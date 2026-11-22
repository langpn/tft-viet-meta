import assert from 'node:assert/strict';

const origin = process.argv[2] ?? 'http://127.0.0.1:4382';

async function request(path, expected = 200) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, expected, path);
  return response;
}

const home = await request('/');
assert.match(await home.text(), /TFT|Đấu Trường Chân Lý/);
const guides = await request('/tierlist/comps');
assert.match(await guides.text(), /Draven Ezreal 9/);
const details = await request('/tierlist/comps?comp=draven-ezreal-9');
assert.match(await details.text(), /Draven Ezreal 9/);
const comp = await (await request('/api/comps/draven-ezreal-9')).json();
assert(comp.comp?.board?.length > 0);
const search = await (await request('/api/options?q=master%20yi')).json();
assert(search.results.some((row) => row.name_en === 'Master Yi'));
await request('/api/explorer?patch=unknown', 400);
await request('/learn/new-set');
const sitemap = await request('/sitemap.xml');
assert.match(await sitemap.text(), /<urlset/);
console.log(`Production smoke passed at ${origin}`);
