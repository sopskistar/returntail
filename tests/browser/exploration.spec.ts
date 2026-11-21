import { test, expect } from '@playwright/test';

test('resolution chapters are keyboard-operable explanations without financial requests', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', req => { if (req.method() !== 'GET') writes.push(req.url()); });
  await page.goto('/');
  const player = page.getByRole('region', { name: 'Play the Resolution' });
  await expect(player.getByText('Interactive explanation · no wallet requests or transactions')).toBeVisible();
  await expect(player.getByRole('heading', { name: 'The customer asks.' })).toBeVisible();
  await player.getByRole('button', { name: 'Next: decision' }).click();
  await player.getByRole('button', { name: 'Why limits apply' }).click();
  await expect(player.getByText('Concurrent approvals lock the purchase record', { exact: false })).toBeVisible();
  await player.getByRole('button', { name: 'Next: authorize' }).focus();
  await page.keyboard.press('Enter');
  await expect(player.getByRole('heading', { name: 'The wallet has the final say.' })).toBeVisible();
  await player.getByRole('button', { name: 'Next: broadcast' }).click();
  await expect(player.getByText('A timeout is an unknown outcome, not proof of failure.')).toBeVisible();
  await player.getByRole('button', { name: 'Next: observe' }).click();
  await player.getByRole('button', { name: 'Next: confirm' }).click();
  await expect(player.getByText('This explanation contains no transaction evidence.', { exact: false })).toBeVisible();
  await player.getByRole('button', { name: 'Play again' }).click();
  await expect(player.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  expect(writes).toEqual([]);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('homepage shows the competition banner immediately below navigation', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('.competition');
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('heading', { name: 'Build. Inspect. Resolve.' })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute(
    'href',
    'https://github.com/sopskistar/ReturnTail',
  );
  await expect(banner.locator('.competition-donation')).toBeVisible();
  const presentation = banner.getByRole('link', { name: 'Widget Factory Presentation' });
  if (await presentation.count()) {
    const url = new URL((await presentation.getAttribute('href'))!);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('docs.google.com');
    expect(url.pathname).toMatch(/^\/presentation\/d\/[A-Za-z0-9_-]+/);
  } else {
    await expect(banner.getByText('Presentation link not configured')).toBeVisible();
  }
  const donation = banner.locator('.competition-donation code');
  if (await donation.count()) {
    await expect(donation).toHaveText(/^bitcoincash:z/);
  } else {
    await expect(banner.getByText('CashTokens address not configured')).toBeVisible();
  }
  expect(
    await page.evaluate(() => {
      const header = document.querySelector('.site-header')!.getBoundingClientRect();
      const ribbon = document.querySelector('.competition')!.getBoundingClientRect();
      const hero = document.querySelector('.hero')!.getBoundingClientRect();
      return ribbon.top >= header.bottom && ribbon.bottom <= hero.top;
    }),
  ).toBe(true);
});

test('financial lab evidence distinguishes chain proof, reported decisions and isolated tests', async ({ page }) => {
  await page.goto('/lab');
  const evidence = page.locator('.invariant-evidence');
  await expect(evidence.getByRole('heading', { name: 'Financial safeguards, with evidence.' })).toBeVisible();
  for (const title of ['Cumulative refund limit', 'Duplicate processing protection', 'Merchant authorization']) {
    const card = evidence.locator('.invariant-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(card).toBeVisible();
    for (const label of ['DO', 'SEE', 'PROOF']) await expect(card.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(evidence.getByRole('link', { name: 'Public confirmed receipt' })).toHaveAttribute(
    'href',
    'https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02',
  );
  await expect(evidence.getByRole('link', { name: 'isolated cumulative-limit assertion' })).toHaveAttribute(
    'href',
    'https://github.com/sopskistar/ReturnTail/blob/main/tests/db/refunds.test.ts#L300',
  );
  await expect(evidence.getByText(/That decision is application evidence/)).toBeVisible();
  await expect(page.locator('.lab-check')).toHaveCount(3);
});

test('lab probes actual local API boundaries with no cookies and no writes', async ({ page }) => {
  const calls: { method: string; cookie?: string; path: string }[] = [];
  page.on('request', req => { if (req.url().includes('/api/')) calls.push({ method: req.method(), cookie: req.headers().cookie, path: new URL(req.url()).pathname }); });
  await page.context().addCookies([{ name: 'unrelated-cookie', value: 'must-not-be-sent', url: 'http://localhost:3001' }]);
  await page.goto('/lab');
  for (const name of ['Public service readiness', 'Private merchant workspace', 'Private purchase access']) {
    const row = page.locator('.lab-check').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await row.getByRole('button', { name: 'Run read-only check' }).click();
    await expect(row.getByRole('status')).toContainText('Expected response observed');
  }
  expect(calls.map(x => x.path)).toEqual(['/api/health', '/api/workspace', '/api/orders/00000000-0000-4000-8000-000000000000']);
  expect(calls.every(x => x.method === 'GET' && !x.cookie)).toBe(true);
});

test('lab does not portray unavailable or unexpected responses as passing evidence', async ({ page }) => {
  // Explicitly isolated HTTP fixtures for frontend failure-state coverage; not hosted evidence.
  await page.route('**/api/health', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"database":false,"configured":false,"network":"chipnet","secret":"NEVER_RENDER_THIS"}' }));
  await page.route('**/api/workspace', route => route.abort());
  await page.goto('/lab');
  const rows = page.locator('.lab-check');
  await rows.nth(0).getByRole('button').click();
  await expect(rows.nth(0).getByRole('status')).toContainText('Unexpected response');
  await expect(page.getByText('NEVER_RENDER_THIS')).toHaveCount(0);
  await rows.nth(1).getByRole('button').click();
  await expect(rows.nth(1).getByRole('status')).toContainText('Check unavailable');
});

test('unfunded preflight keeps index-zero stop visible and comparison disabled without a wallet', async ({ page }) => {
  await page.goto('/wallet-check');
  await expect(page.getByText('Existing index-zero requests are preserved with new funding paused.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare address locally' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Selene: your customer wallet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Connect wallet', exact: true })).toBeVisible();
});

test('exploration surfaces fit desktop, tablet and narrow phone with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 360]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ['/', '/lab', '/wallet-check']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (route === '/') {
        await page.getByRole('button', { name: 'Next: decision' }).click();
        expect(await page.locator('.player-chapter').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
      }
    }
  }
});
