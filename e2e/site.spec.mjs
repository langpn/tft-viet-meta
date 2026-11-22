import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') return route.fallback();
    return route.abort();
  });
});

test('opens a comp deep link and closes the panel with Escape', async ({ page }) => {
  await page.goto('/tierlist/comps?comp=draven-ezreal-9');
  const close = page.getByRole('button', { name: 'Đóng chi tiết' });
  await expect(close).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(close).toHaveCount(0);
  await expect(page).not.toHaveURL(/comp=/);
});

test('loads a comp variant and keeps its direct link', async ({ page }) => {
  await page.goto('/tierlist/comps?comp=ahri-morgana');
  await Promise.all([
    page.waitForResponse((result) => result.url().includes('/api/comps/') && result.ok()),
    page.getByRole('button', { name: /Ahri Zyra/ }).click(),
  ]);
  await expect(page).toHaveURL(/comp=ahri-zyra/);
  await expect(page.getByRole('button', { name: 'Đóng chi tiết' })).toBeVisible();
});

test('opens a comp with Space and returns focus to its card on Escape', async ({ page }) => {
  await page.goto('/tierlist/comps');
  const card = page.getByTitle(/Draven Ezreal 9/).first();
  await card.focus();
  await page.keyboard.press('Space');
  const close = page.getByRole('button', { name: 'Đóng chi tiết' });
  await expect(close).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(close).toHaveCount(0);
  await expect(card).toBeFocused();
});

test('finds Vietnamese traits and champions without accents', async ({ page }) => {
  await page.goto('/learn/new-set');
  await page.getByRole('button', { name: /Tướng Mới/ }).click();
  await page.getByPlaceholder(/Tìm kiếm nội dung/).fill('hoa nguc');
  await expect(page.getByText('Hỏa Ngục', { exact: true }).first()).toBeVisible();
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
    await rank.selectOption('3');
    await expect(page.getByText('Số trận: 333')).toBeVisible();
  } finally {
    releaseOld();
  }
  await expect(page.getByText('Số trận: 333')).toBeVisible();
});
