import { describe, expect, test } from 'bun:test';
import {
  buildSiteMeta,
  compSlug,
  compUrl,
  describeSegments,
  escapeXml,
  findComp,
  getCompDetail,
  getVariants,
  safeJsonLd,
  toCompCard,
  toLandingCard
} from '../src/lib/comp-pages';

const sampleComps = [
  {
    id: 'comp-1',
    slug: 'draven-ezreal-9',
    title: 'Draven Ezreal 9',
    metaTitle: 'Draven Ezreal Fast 9',
    tier: 'S',
    trend: 'Rising',
    sticker: 'S+',
    situationalTier: null,
    compStyle: 'Fast 9',
    coreBadges: [{ id: 'DA_GuinsoosRageblade', name_vi: 'Cuồng Đao Guinsoo', type: 'item' }],
    traits: [{ id: 'Noxus', name: 'Noxus', name_vi: 'Noxus', count: 3 }],
    mainChampion: { apiName: 'TFT18_Draven', extraHugeField: 'drop-me' },
    mainCarry: {
      id: 'TFT18_Draven',
      name: 'Draven',
      name_en: 'Draven',
      name_vi: 'Draven',
      cost: 4,
      icon: 'draven.png',
      starLevel: 2,
      bio: 'heavy-unused',
      items: [{ id: 'DA_GuinsoosRageblade', name_en: "Guinsoo's Rageblade", name_vi: 'Cuồng Đao', icon: 'rb.png', desc_vi: 'long' }]
    },
    mainTank: {
      id: 'TFT18_Swain',
      name_en: 'Swain',
      name_vi: 'Swain',
      cost: 4,
      icon: 'swain.png',
      starLevel: 2,
      items: []
    },
    board: [
      { id: 'TFT18_Draven', name_en: 'Draven', name_vi: 'Draven', cost: 4, icon: 'draven.png', items: [] },
      { id: 'TFT18_Ezreal', name_en: 'Ezreal', name_vi: 'Ezreal', cost: 5, icon: 'ez.png', items: [] }
    ],
    augments: [{ id: 'Aug1', name_en: 'Rich Get Richer', name_vi: 'Giàu Càng Thêm Giàu', desc_vi: 'huge' }],
    earlyBoard: [{ id: 'heavy' }],
    midBoard: [{ id: 'heavy' }],
    finalComp: [{ id: 'heavy' }],
    tips: ['long guide text'],
    leveling: ['4-1 level 8'],
    carousel: ['Bow']
  },
  {
    id: 'comp-2',
    slug: 'draven-dragon-9',
    title: 'Draven Dragon 9',
    tier: 'S',
    mainCarry: { id: 'TFT18_Draven', name_en: 'Draven', name_vi: 'Draven', cost: 4, icon: 'draven.png', items: [] },
    board: [],
    augments: []
  },
  {
    id: 'comp-3',
    slug: 'ahri-zyra',
    title: 'Ahri & Zyra <Test>',
    tier: 'A',
    mainCarry: { id: 'TFT18_Ahri', name_en: 'Ahri', name_vi: 'Ahri', cost: 4, icon: 'ahri.png', items: [] },
    board: [],
    augments: []
  }
];

describe('comp-pages helpers', () => {
  test('toCompCard and toLandingCard strip heavy detail fields and keep card/search fields', () => {
    const card = toCompCard(sampleComps[0]);
    expect(card.id).toBe('comp-1');
    expect(card.augments).toEqual([{ id: 'Aug1', name_en: 'Rich Get Richer', name_vi: 'Giàu Càng Thêm Giàu' }]);
    expect((card as any).earlyBoard).toBeUndefined();
    expect((card as any).finalComp).toBeUndefined();
    expect((card as any).tips).toBeUndefined();
    expect((card.mainCarry as any).bio).toBeUndefined();
    expect(card.mainCarry?.items[0]).toEqual({ id: 'DA_GuinsoosRageblade', name_en: "Guinsoo's Rageblade", name_vi: 'Cuồng Đao', icon: 'rb.png' });

    const landing = toLandingCard(sampleComps[0]);
    expect((landing as any).augments).toBeUndefined();
    expect(landing.title).toBe('Draven Ezreal 9');
  });

  test('findComp, getVariants, and getCompDetail resolve slugs and variants', () => {
    expect(compSlug(sampleComps[0])).toBe('draven-ezreal-9');
    expect(findComp(sampleComps, 'draven-ezreal-fast-9')?.id).toBe('comp-1');
    expect(findComp(sampleComps, 'COMP-2')?.id).toBe('comp-2');

    const detail = getCompDetail(sampleComps, 'draven-ezreal-9');
    expect(detail?.comp.id).toBe('comp-1');
    expect(detail?.variants.map((v) => v.id)).toEqual(['comp-1', 'comp-2']);
    expect(getVariants(sampleComps, sampleComps[2]).map((v) => v.id)).toEqual(['comp-3']);
    expect(getCompDetail(sampleComps, 'does-not-exist')).toBeNull();
  });

  test('buildSiteMeta derives counts and patch from data instead of hardcoding', () => {
    const meta = buildSiteMeta(
      sampleComps,
      {
        craftables: { S: [{}, {}], A: [{}] },
        radiants: { S: [{}] },
        artifacts: { B: [{}, {}] },
        emblems: { C: [{}] }
      },
      {
        silver: { S: [{}] },
        gold: { S: [{}, {}] },
        prismatic: { A: [{}, {}, {}] }
      },
      { patch: '18.6a', set: 18 }
    );

    expect(meta).toEqual({
      patch: '18.6a',
      set: 18,
      compCount: 3,
      itemCount: 7,
      augmentCount: 6
    });
  });

  test('safeJsonLd escapes < to prevent closing script tag and parses back identically', () => {
    const payload = { name: '</script><script>alert(1)</script>', ok: true };
    const serialized = safeJsonLd(payload);
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script>');
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  test('compUrl and escapeXml encode URL slugs and XML entities', () => {
    const url = compUrl({ id: 'x&y', title: '' });
    expect(url).toBe('https://tft.langpn.xyz/tierlist/comps?comp=x%26y');
    expect(escapeXml(`${url}&tab=1`)).toBe('https://tft.langpn.xyz/tierlist/comps?comp=x%26y&amp;tab=1');
    expect(escapeXml(`a<b&c>"d'`)).toBe('a&lt;b&amp;c&gt;&quot;d&apos;');
  });

  test('describeSegments strips markup and emits safe text segments with keyword highlights', () => {
    const segs = describeSegments('Tăng 20% {{stat}} Tốc Độ Đánh và <script>alert(1)</script> Máu.');
    expect(segs.map((s) => s.text).join('')).toBe('Tăng 20% Tốc Độ Đánh và alert(1) Máu.');
    expect(segs.find((s) => s.text === 'Tốc Độ Đánh')?.cls).toContain('text-[#FFD790]');
    expect(segs.find((s) => s.text === 'Máu')?.cls).toContain('text-emerald-400');
  });
});
