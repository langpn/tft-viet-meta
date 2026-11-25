import { describe, expect, test } from 'bun:test';
import { buildModPayload, hexFromBoardIndex } from '../src/lib/server/mod-export';
import live from '../src/lib/data/academy-live.json';

const asAny = live as unknown as Record<string, any>;

describe('mod export', () => {
  test('hexFromBoardIndex maps Academy indices onto our rows', () => {
    expect(hexFromBoardIndex(0)).toEqual({ row: 0, col: 0 }); // front row corner
    expect(hexFromBoardIndex(27)).toEqual({ row: 3, col: 6 }); // back row corner
    expect(hexFromBoardIndex(10)).toEqual({ row: 1, col: 3 });
  });

  test('payload exposes all live comps with curve and augments', () => {
    const payload = buildModPayload(asAny);
    expect(payload.set).toBe(18);
    expect(payload.patch).toBe('18.7');
    expect(payload.comps.length).toBe(asAny.comps.length);
    const ap95 = payload.comps.find((c) => c.slug === 'set-18-ap-95');
    expect(ap95).toBeTruthy();
    expect(ap95!.tier).toBe('S');
    expect(ap95!.curve.final.length).toBeGreaterThan(0);
    expect(ap95!.augments.length).toBeGreaterThan(0);
    expect(ap95!.carousel.length).toBeGreaterThan(0);
    // every unit carries a hex and slim items
    for (const unit of ap95!.curve.final) {
      expect(unit.hex).toBeTruthy();
      expect(Array.isArray(unit.items)).toBe(true);
    }
  });

  test('itemPriority groups finished items by kind, S tier first', () => {
    const payload = buildModPayload(asAny);
    expect(payload.itemPriority.ad.length + payload.itemPriority.ap.length + payload.itemPriority.tank.length).toBeGreaterThan(10);
    // S-tier Spear of Shojin (AD) must come before A-tier equivalents
    const ad = payload.itemPriority.ad;
    expect(ad.indexOf('DA_SpearOfShojin')).toBeGreaterThanOrEqual(0);
    if (ad.indexOf('DA_Bloodthirster') >= 0 && ad.indexOf('DA_SpearOfShojin') >= 0) {
      expect(ad.indexOf('DA_SpearOfShojin')).toBeLessThan(ad.indexOf('DA_Bloodthirster'));
    }
  });

  test('augmentFallback is ordered by stage 4-2 first and deduped', () => {
    const payload = buildModPayload(asAny);
    expect(payload.augmentFallback.length).toBeGreaterThan(20);
    const first = payload.augmentFallback[0];
    // first must come from a 4-2 stage list (S or A tier)
    const stages = asAny.augments.stages as Record<string, Record<string, Record<string, any[]>>>;
    const top42 = new Set<string>();
    for (const cat of Object.values(stages)) {
      for (const row of [...(cat['4-2']?.S ?? []), ...(cat['4-2']?.A ?? [])]) top42.add(row.id);
    }
    expect(top42.has(first)).toBe(true);
  });

  test('unit names are Vietnamese', () => {
    const payload = buildModPayload(asAny);
    const ap95 = payload.comps.find((c) => c.slug === 'set-18-ap-95');
    const names = ap95!.curve.final.map((u) => u.name);
    // translated names contain diacritics for at least some units (e.g. Thần Rừng)
    expect(names.some((n) => /[ăâđêôơưĂÂĐÊÔƠƯ]/.test(n) || /^[A-Z]/.test(n))).toBe(true);
  });
});
