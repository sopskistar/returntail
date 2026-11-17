import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPublicNode,
  encodeHdPublicKey,
  sha256,
} from '@bitauth/libauth';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { purchaseFixture, destination } from '../fixtures';
const email = `qa-${Date.now()}@returntail.invalid`,
  password = 'Isolated-ReturnTail-Browser-2026';
const xpub = encodeHdPublicKey({
  node: deriveHdPublicNode(
    deriveHdPrivateNodeFromSeed(sha256.hash(new TextEncoder().encode(email))),
  ),
  network: 'testnet',
}).hdPublicKey;
test.describe.serial('real localhost app, no blockchain transfers', () => {
  let privateLink = '',
    orderId = '';
  test.beforeAll(async () => {
    await mkdir('artifacts/screenshots', { recursive: true });
  });
  test('homepage explains product, links to real routes, and has no client errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Make it right. Make it verifiable.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open your workspace' })).toBeVisible();
    await page.getByRole('link', { name: 'Explore the workflow' }).click();
    await expect(page).toHaveURL(/\/guide/);
    await expect(
      page.getByRole('heading', { name: 'The merchant signs a new transaction.' }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
  test('phone and tablet pages preserve layout and navigation', async ({ page }) => {
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole('link', { name: 'Open your workspace' })).toBeVisible();
    }
  });
  test('rejects unauthorized APIs and cross-origin mutations', async ({ request, baseURL }) => {
    expect((await request.get('/api/workspace')).status()).toBe(401);
    expect(
      (
        await request.post('/api/orders', {
          headers: { origin: 'https://evil.invalid' },
          data: { title: 'Attack', amount: 1000 },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.post('/api/orders', {
          headers: { origin: baseURL! },
          data: { title: 'Attack', amount: 1000 },
        })
      ).status(),
    ).toBe(401);
  });
  test('registration creates a genuine session and usable empty workspace', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Store name', { exact: true }).fill('QA isolated merchant');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create merchant account' }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(
      page.getByRole('heading', { name: 'Your first payment starts here.' }),
    ).toBeVisible();
    await page.screenshot({ path: 'artifacts/screenshots/workspace-desktop.png', fullPage: true });
    const cookie = (await page.context().cookies()).find((c) => c.name === 'returntail_session');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
  });
  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/workspace$/);
  }
  test('store settings save, xpub configuration, and order creation use real APIs', async ({
    page,
    baseURL,
  }) => {
    await login(page);
    await page.getByRole('link', { name: 'Store & wallet' }).click();
    await expect(page.getByRole('heading', { name: 'Store profile', exact: true })).toBeVisible();
    await page.getByLabel('Store name', { exact: true }).fill('QA isolated fixture store');
    await page.getByRole('button', { name: 'Save store profile' }).click();
    await expect(page.getByRole('status')).toContainText('Store profile saved');
    // A deterministic public TEST key is configured only for this isolated local QA account. No funds are sent.
    const configured = await page.request.post('/api/store', {
      headers: { origin: baseURL! },
      data: { name: 'QA isolated fixture store', xpub },
    });
    expect(configured.status()).toBe(200);
    await page.goto('/workspace/new');
    await page.getByLabel('Purchase description').fill('ISOLATED QA purchase — no funds');
    await page.getByLabel('Amount in satoshis').fill('10000');
    await page.getByRole('button', { name: 'Create private payment request' }).click();
    await expect(page.getByRole('heading', { name: 'Ready for your customer.' })).toBeVisible();
    privateLink = await page
      .getByRole('textbox', { name: 'Private customer purchase link' })
      .inputValue();
    orderId = new URL(privateLink).pathname.split('/').pop()!;
    expect(privateLink).toContain('#access=');
    await page.getByRole('link', { name: 'View purchase', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'ISOLATED QA purchase — no funds' }),
    ).toBeVisible();
    await expect(page.getByText('Awaiting payment', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'artifacts/screenshots/purchase-desktop.png', fullPage: true });
  });
  test('private capability opens customer checkout, and tampering is rejected', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
      }),
      page = await context.newPage();
    await page.goto(privateLink);
    await expect(
      page.getByRole('heading', { name: 'ISOLATED QA purchase — no funds' }),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/#access/);
    await expect(page.getByRole('button', { name: 'Prepare payment' })).toBeDisabled();
    await page.screenshot({ path: 'artifacts/screenshots/checkout-mobile.png', fullPage: true });
    const bad = await context.request.get(`${baseURL}/api/orders/${orderId}`, {
      headers: { authorization: 'Bearer invalid-capability'.padEnd(60, 'x') },
    });
    expect(bad.status()).toBe(404);
    await context.close();
  });
  test('WizardConnect creates an actual pairing QR and supports cancellation', async ({ page }) => {
    await page.goto(privateLink);
    await expect(page.getByRole('heading', { name: 'Pay with your wallet' })).toBeVisible();
    await page.locator('main').getByRole('button', { name: 'Connect wallet', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open wallet', exact: true })).toHaveAttribute(
      'href',
      /^wiz:\/\//i,
    );
    await expect(page.getByRole('dialog').locator('canvas')).toBeVisible();
    await page.getByRole('button', { name: 'Close wallet connection' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
  test('isolated confirmed-payment fixture supports real refund forms, safe text and merchant reservation', async ({
    page,
    browser,
    baseURL,
  }) => {
    // This is the only browser test that seeds chain states. It is restricted to a LOCAL QA account,
    // labeled explicitly in the product, and never broadcasts or claims independent network observation.
    expect(new URL(baseURL!).hostname).toBe('localhost');
    const db = new Pool({
      connectionString:
        'postgresql://returntail:returntail-local-test-only@127.0.0.1:55432/returntail',
    });
    try {
      const record = await db.query(
        'SELECT o.* FROM orders o JOIN stores s ON s.id=o.store_id JOIN merchants m ON m.id=s.merchant_id WHERE o.id=$1 AND m.email=$2 AND o.title LIKE $3',
        [orderId, email, 'ISOLATED QA%'],
      );
      expect(record.rows).toHaveLength(1);
      const fixture = purchaseFixture(record.rows[0].address);
      await db.query(
        "INSERT INTO payments(id,order_id,network,txid,vout,amount,confirmations,block_hash,block_height,state,evidence) VALUES($1,$2,'chipnet',$3,0,10000,1,$4,100,'confirmed',$5)",
        [
          randomUUID(),
          orderId,
          fixture.txid,
          'bb'.repeat(32),
          JSON.stringify({
            provider: 'ISOLATED TEST FIXTURE — not network evidence',
            merkleVerified: false,
            witness: null,
          }),
        ],
      );
      await db.query("UPDATE orders SET state='confirmed' WHERE id=$1", [orderId]);
    } finally {
      await db.end();
    }
    const customer = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
      }),
      purchase = await customer.newPage();
    await purchase.goto(privateLink);
    await purchase.getByLabel('Refund amount in satoshis').fill('4000');
    await purchase.getByLabel('Your refund address').fill(destination);
    const malicious = '<img src=x onerror="window.__qaXss=1"> Damaged parcel (isolated fixture)';
    await purchase.getByLabel('What happened?').fill(malicious);
    await purchase.getByRole('button', { name: 'Request refund', exact: true }).click();
    await expect(purchase.getByText(malicious, { exact: true })).toBeVisible();
    expect(await purchase.evaluate(() => '__qaXss' in window)).toBe(false);
    expect(await purchase.locator('img[src=x]').count()).toBe(0);
    await customer.close();
    await login(page);
    await page.goto(`/workspace/orders/${orderId}`);
    await page.getByRole('button', { name: 'Approve & reserve amount' }).click();
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();
    await expect(page.getByText('4,000 sats', { exact: true })).toBeVisible();
    await page.screenshot({
      path: 'artifacts/screenshots/refund-approved-fixture-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'artifacts/screenshots/refund-approved-fixture-mobile.png',
      fullPage: true,
    });
  });
  test('signed-attempt endpoints reject authorization bypass', async ({ request, baseURL }) => {
    const response = await request.post(`/api/attempts/${randomUUID()}/sign`, {
      headers: { origin: baseURL! },
      data: { raw: '00'.repeat(100) },
    });
    expect(response.status()).toBe(401);
    expect((await request.get(`/api/resolutions/${randomUUID()}`)).status()).toBe(404);
  });
  test('merchant session revocation protects the workspace', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL(/\/login/);
    expect((await page.request.get('/api/workspace')).status()).toBe(401);
  });
  test('metadata, icons, security headers, sitemap and custom 404 are served', async ({
    page,
    request,
  }) => {
    const response = await page.goto('/evidence');
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    expect(response?.headers()['content-security-policy']).toContain('wasm-unsafe-eval');
    await expect(page).toHaveTitle('Evidence and verification | ReturnTail');
    for (const path of [
      '/robots.txt',
      '/sitemap.xml',
      '/icon.svg',
      '/brand/social.png',
      '/manifest.webmanifest',
    ])
      expect((await request.get(path)).status()).toBe(200);
    const missing = await page.goto('/a-trail-that-does-not-exist');
    expect(missing?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This trail ends here.' })).toBeVisible();
  });
});
