import { describe, expect, test } from 'bun:test';
import metaManifest from '../src/lib/data/meta-manifest.json' with { type: 'json' };
import {
  DEFAULT_PATCH,
  DEFAULT_RANK,
  EXPLORER_HOST,
  EXPLORER_PATCHES,
  MAX_TOKEN_LENGTH,
  MAX_TOKEN_SEGMENTS,
  buildExplorerSourceUrl,
  buildTokenString,
  createLatest,
  parseExplorerParams,
  removeFilterAt,
  type ExplorerFilter
} from '../src/lib/explorer-contract';
import { fetchExplorer, normalizeExplorerData } from '../src/lib/server/explorer-service';
import { matchesQuery } from '../src/lib/utils/search';

describe('explorer-contract', () => {
  test('defaults to patch 18.7 and offers the previous verified patch', () => {
    expect(DEFAULT_PATCH).toBe('16230');
    expect(DEFAULT_RANK).toBe(String(metaManifest.explorer.rankGroup));
    expect(EXPLORER_PATCHES).toContainEqual({ value: DEFAULT_PATCH, label: 'Patch 18.7' });
    expect(EXPLORER_PATCHES).toContainEqual({ value: metaManifest.explorer.patchId, label: `Patch ${metaManifest.patch}` });
    expect(parseExplorerParams({ patch: '16211' }).ok).toBe(false);
  });

  test('parseExplorerParams applies defaults when missing and rejects unknown values', () => {
    const def = parseExplorerParams({});
    expect(def).toEqual({
      ok: true,
      value: { patch: DEFAULT_PATCH, rank: DEFAULT_RANK, tokens: '0' }
    });

    expect(parseExplorerParams({ patch: '99999' }).ok).toBe(false);
    expect(parseExplorerParams({ rank: '9' }).ok).toBe(false);

    const valid = parseExplorerParams({
      patch: '16230',
      rank: '0',
      tokens: 'u-TFT18_Ahri-2/i-TFT_Item_JeweledGauntlet-TFT18_Ahri-2/t-TFT18_StarGuardian-1/a-TFT18_Augment-1'
    });
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(buildExplorerSourceUrl(valid.value).startsWith(`${EXPLORER_HOST}/explorer-data/`)).toBe(true);
    }
  });

  test('parseExplorerParams rejects invalid token grammar and length/segment limits', () => {
    expect(parseExplorerParams({ tokens: 'u-Ahri-4' }).ok).toBe(false);
    expect(parseExplorerParams({ tokens: 'x-Ahri-1' }).ok).toBe(false);
    expect(parseExplorerParams({ tokens: '../etc/passwd' }).ok).toBe(false);

    const tooMany = Array.from({ length: MAX_TOKEN_SEGMENTS + 1 }, (_, i) => `u-Unit${i}-0`).join('/');
    expect(parseExplorerParams({ tokens: tooMany }).ok).toBe(false);

    const tooLong = `u-${'A'.repeat(MAX_TOKEN_LENGTH)}-0`;
    expect(parseExplorerParams({ tokens: tooLong }).ok).toBe(false);
  });

  test('removeFilterAt drops orphan items when unit is removed', () => {
    const filters: ExplorerFilter[] = [
      { type: 'u', id: 'Ahri', starLevel: 2 },
      { type: 'i', id: 'JG', userUnitId: 'Ahri' },
      { type: 't', id: 'Arcana', tier: 1 }
    ];
    expect(removeFilterAt(filters, 0)).toEqual([{ type: 't', id: 'Arcana', tier: 1 }]);

    const twoUnits: ExplorerFilter[] = [
      { type: 'u', id: 'Ahri', starLevel: 2 },
      { type: 'u', id: 'Syndra', starLevel: 0 },
      { type: 'i', id: 'JG', userUnitId: 'Ahri' },
      { type: 'i', id: 'BB', userUnitId: 'Syndra' }
    ];
    const afterRemovingAhri = removeFilterAt(twoUnits, 0);
    expect(afterRemovingAhri).toEqual([
      { type: 'u', id: 'Syndra', starLevel: 0 },
      { type: 'i', id: 'BB', userUnitId: 'Syndra' }
    ]);
    expect(buildTokenString(afterRemovingAhri)).toBe('u-Syndra-0/i-BB-Syndra-0');
  });

  test('createLatest aborts superseded requests and marks them non-current', () => {
    const slot = createLatest();
    const first = slot.next();
    expect(first.isCurrent()).toBe(true);
    expect(first.signal.aborted).toBe(false);

    const second = slot.next();
    expect(first.signal.aborted).toBe(true);
    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);

    slot.cancel();
    expect(second.signal.aborted).toBe(true);
    expect(second.isCurrent()).toBe(false);
  });
});

describe('explorer-service', () => {
  test('rejects missing base and handles explicit zero and augment rows', () => {
    const params = { patch: DEFAULT_PATCH, rank: DEFAULT_RANK, tokens: '0' };
    expect(() => normalizeExplorerData({ units: [] }, params)).toThrow('invalid explorer base aggregate');
    const empty = normalizeExplorerData(
      {
        base: { count: 0, place: 0, top4: 0, won: 0 },
        units: [['Ahri', { count: 0, place: 0, top4: 0, won: 0 }]],
        augments: [['TFT_Augment_Test', { count: 10, place: 35, top4: 7, won: 2, delta: -0.3 }]],
        star_units: [['Ahri', 2, { count: 0, place: 0, top4: 0, won: 0 }]],
        items: 'malformed',
        traits: [['BadRow']]
      },
      params
    );

    expect(empty.empty).toBe(true);
    expect(empty.summary).toEqual({ games: 0, avgPlace: 0, top4Rate: 0, winRate: 0 });
    expect(empty.units[0]).toMatchObject({ id: 'Ahri', games: 0, pickRate: 0, avgPlace: 0, top4Rate: 0, winRate: 0 });
    expect(empty.augments[0]).toMatchObject({ id: 'TFT_Augment_Test', games: 10, avgPlace: 3.5, top4Rate: 0.7, winRate: 0.2, delta: -0.3 });
    expect(empty.items).toEqual([]);
    expect(empty.traits).toEqual([]);
    expect(() => normalizeExplorerData([], params)).toThrow(TypeError);
  });

  test('fetchExplorer returns safe errors on upstream failure, timeout, and abort', async () => {
    const params = { patch: DEFAULT_PATCH, rank: DEFAULT_RANK, tokens: '0' };

    const notFound = await fetchExplorer(params, {
      fetch: (async () => new Response('secret upstream detail', { status: 404 })) as unknown as typeof fetch
    });
    expect(notFound).toEqual({ ok: false, status: 404, error: 'Không có dữ liệu cho bộ lọc này' });

    const upstreamErr = await fetchExplorer(params, {
      fetch: (async () => new Response('https://d3.tft.tools internal stack', { status: 500 })) as unknown as typeof fetch
    });
    expect(upstreamErr.ok).toBe(false);
    if (!upstreamErr.ok) {
      expect(upstreamErr.status).toBe(502);
      expect(upstreamErr.error).not.toContain('d3.tft.tools');
      expect(upstreamErr.error).not.toContain('internal stack');
    }

    const ac = new AbortController();
    ac.abort();
    const aborted = await fetchExplorer(params, {
      signal: ac.signal,
      fetch: (async (_u: any, init: any) => {
        if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        return new Response('{}', { status: 200 });
      }) as unknown as typeof fetch
    });
    expect(aborted).toEqual({ ok: false, status: 499, error: 'Yêu cầu đã bị hủy' });
  });
});

describe('unicode search', () => {
  test('matchesQuery supports Vietnamese and Japanese ordinary inputs', () => {
    expect(matchesQuery('Vô Cực Kiếm', 'vo cuc')).toBe(true);
    expect(matchesQuery('Đấu Sĩ', 'dau si')).toBe(true);
    expect(matchesQuery('アーリ (Ahri)', 'アーリ')).toBe(true);
    expect(matchesQuery('ヤスオ', 'ヤス')).toBe(true);
  });
});
