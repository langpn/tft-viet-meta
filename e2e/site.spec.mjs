import { expect, test } from '@playwright/test';
import comps from '../src/lib/data/academy-comps.json' with { type: 'json' };
import newSet from '../src/lib/data/academy-new-set.json' with { type: 'json' };
import { compSlug, getVariants } from '../src/lib/comp-pages.ts';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') return route.fallback();
    return route.abort();
  });
});

test('opens a comp deep link and closes the panel with Escape', async ({ page }) => {
  await page.goto(`/tierlist/comps?comp=${encodeURIComponent(compSlug(comps[0]))}`);
  const close = page.getByRole('button', { name: 'Đóng chi tiết' });
  await expect(close).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(close).toHaveCount(0);
  await expect(page).not.toHaveURL(/comp=/);
});

test('loads a comp variant and keeps its direct link', async ({ page }) => {
  const guide = comps.find((comp) => getVariants(comps, comp).length > 1);
  test.skip(!guide, 'The published tier list has no variants');
  const variantId = getVariants(comps, guide).find((comp) => comp.id !== guide.id).id;
  const variant = comps.find((comp) => comp.id === variantId);
  await page.goto(`/tierlist/comps?comp=${encodeURIComponent(compSlug(guide))}`);
  await Promise.all([
    page.waitForResponse((result) => result.url().includes('/api/comps/') && result.ok()),
    page.getByRole('button').filter({ has: page.getByText(variant.title, { exact: true }) }).click(),
  ]);
  await expect(page).toHaveURL((url) => url.searchParams.get('comp') === compSlug(variant));
  await expect(page.getByRole('button', { name: 'Đóng chi tiết' })).toBeVisible();
});

test('opens a comp with Space and returns focus to its card on Escape', async ({ page }) => {
  await page.goto('/tierlist/comps');
  const card = page.locator('[role="button"][aria-expanded][title]').first();
  await card.focus();
  await page.keyboard.press('Space');
  const close = page.getByRole('button', { name: 'Đóng chi tiết' });
  await expect(close).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(close).toHaveCount(0);
  await expect(card).toBeFocused();
});

test('finds Vietnamese traits and champions with or without accents', async ({ page }) => {
  await page.goto('/learn/new-set');
  await page.getByRole('button', { name: /Tướng Mới/ }).click();
  const unaccent = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd');
  const trait = newSet.champions.flatMap((champion) => champion.traits)
    .find((entry) => entry.name_vi && unaccent(entry.name_vi) !== entry.name_vi);
  expect(trait, 'The Vietnamese catalog contains an accented trait').toBeDefined();
  for (const query of [trait.name_vi, unaccent(trait.name_vi).toLowerCase()]) {
    await page.getByPlaceholder(/Tìm kiếm nội dung/).fill(query);
    await expect(page.getByText(trait.name_vi, { exact: true }).first()).toBeVisible();
  }
});

test('keeps the latest Explorer result when the previous rank is slow', async ({ page }) => {
  const payload = (games) => ({
    empty: false, summary: { games, avgPlace: 4, top4Rate: 0.5, winRate: 0.12 },
    units: [], starUnits: [], traits: [], items: [], augments: [],
  });
  let markPending;
  const pending = new Promise((resolve) => { markPending = resolve; });
  let releaseOld;
  const oldResponse = new Promise((resolve) => { releaseOld = resolve; });
  await page.route('**/api/explorer?*', async (route) => {
    const rank = new URL(route.request().url()).searchParams.get('rank');
    if (rank === '2') {
      markPending();
      await oldResponse;
      await route.fulfill({ json: payload(222) }).catch(() => {});
      return;
    }
    await route.fulfill({ json: payload(rank === '3' ? 333 : 111) });
  });
  await page.goto('/explorer?patch=unknown');
  await expect(page.getByText('Số trận: 111')).toBeVisible();
  const rank = page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Diamond+' }) });
  await rank.selectOption('2');
  await pending;
  try {
    const aborted = page.waitForEvent('requestfailed', { predicate: (request) => {
      const url = new URL(request.url());
      return url.pathname === '/api/explorer' && url.searchParams.get('rank') === '2';
    } });
    await rank.selectOption('3');
    await expect(page.getByText('Số trận: 333')).toBeVisible();
    expect((await aborted).failure()).toBeTruthy();
  } finally {
    releaseOld();
  }
  await expect(page.getByText('Số trận: 333')).toBeVisible();
});

test('shows an upstream error and recovers to the empty Explorer state', async ({ page }) => {
  await page.route('**/api/explorer?*', (route) => {
    const rank = new URL(route.request().url()).searchParams.get('rank');
    if (rank === '1') return route.fulfill({ status: 502, json: { error: 'Nguồn dữ liệu đang lỗi' } });
    return route.fulfill({ json: {
      empty: true, summary: { games: 0, avgPlace: 0, top4Rate: 0, winRate: 0 },
      units: [], starUnits: [], traits: [], items: [], augments: [],
    } });
  });
  await page.goto('/explorer?patch=unknown');
  await expect(page.getByText('Nguồn dữ liệu đang lỗi', { exact: true })).toBeVisible();
  const rank = page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Diamond+' }) });
  await rank.selectOption('2');
  await expect(page.getByText('Số trận: 0')).toBeVisible();
  await expect(page.getByText(/Không có dữ liệu tướng nào đạt tối thiểu/)).toBeVisible();
});
