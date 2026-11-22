import { expect, test } from 'bun:test';
import { captureSet19 } from '../scripts/stage-set19';

test('captures Set 19 previews without executing Academy JavaScript', async () => {
  const champions = [{ name: 'Ahri', cost: 4, traits: ['K|DA'], ability: 'Hit an enemy marked "Hyped".' }];
  const traits = [{ name: 'K|DA', type: 'Origin', breakpoints: [3] }];
  const augments = [{ name: 'Level Up!', tier: 3, description: 'Gain XP.' }];
  const chunk = [champions, traits, augments].map((rows) =>
    'JSON.parse(`' + JSON.stringify(rows).replaceAll('\\', '\\\\') + '`)'
  ).join(';');
  const fetchFn = mockAcademy(19, chunk);
  const preview = await captureSet19(fetchFn);
  expect(preview.status).toBe('PREVIEW');
  expect(preview.learn.champions).toEqual(champions);
  expect(preview.sources).toHaveLength(5);
});

test('rejects mismatched seasons and incomplete Academy previews', async () => {
  await expect(captureSet19(mockAcademy(18, ''))).rejects.toThrow('Expected TFT Academy Set 19');
  await expect(captureSet19(mockAcademy(19, ''))).rejects.toThrow('Missing Set 19 learning sections');
});

function mockAcademy(set: number, chunk: string) {
  return (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    switch (url.pathname) {
      case '/api/tierlist/comps':
        expect(url.searchParams.get('set')).toBe('19');
        return Response.json({ guides: [{ set: 19, id: 'guide', title: 'Test', finalComp: [{ apiName: 'DA_Ahri19', boardIndex: 3 }] }] });
      case '/api/tierlist/items':
        return Response.json({ items_tierlists: ['craftables', 'radiants', 'ornns', 'emblems'].map((type) => ({ set: 19, type, tier: { S: ['DA_GuinsoosRageblade'] } })) });
      case '/api/tierlist/augments':
        return Response.json({ augments_tierlists: [1, 2, 3].map((augmenttier) => ({ set: 19, augmenttier, stage: 'All', tier: { S: ['DA_LevelUp'] } })) });
      case '/learn/new-set':
        return new Response(`<title>TFT Set ${set}: Prismatic Tour</title><h1>Set ${set} is here.</h1>`, {
          headers: { link: '<../_app/immutable/nodes/example.js>; rel="modulepreload"' },
        });
      case '/_app/immutable/nodes/example.js': return new Response(chunk);
      default: throw new Error(`Unexpected source ${url}`);
    }
  }) as typeof fetch;
}
