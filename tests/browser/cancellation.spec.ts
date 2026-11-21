// ISOLATED localhost fixtures only. No wallet signing or blockchain broadcasts.
import { test, expect } from '@playwright/test';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { readFile, mkdir } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { Pool } from 'pg';
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPublicNode,
  encodeHdPublicKey,
} from '@bitauth/libauth';
import { deriveAddress } from '../../src/core/bch';

test('merchant cancels preserved zero request and creates an exact reviewed private correction', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const localEnv = parseEnv(await readFile('.env.local', 'utf8'));
  const databaseURL = process.env.RETURNTAIL_BROWSER_DATABASE_URL ?? localEnv.DATABASE_URL;
  if (!databaseURL || !['localhost', '127.0.0.1'].includes(new URL(databaseURL).hostname))
    throw Error('Browser fixtures require a localhost database.');
  const db = new Pool({ connectionString: databaseURL });
  const secret = process.env.AUTH_SECRET ?? localEnv.AUTH_SECRET;
  if (!secret) throw Error('The isolated browser database requires its local AUTH_SECRET.');
  const email = `cancel-${randomUUID()}@returntail.invalid`;
  const xpub = encodeHdPublicKey({
    node: deriveHdPublicNode(deriveHdPrivateNodeFromSeed(randomBytes(32))),
    network: 'testnet',
  }).hdPublicKey;
  const oldId = randomUUID(),
    cap = randomBytes(32).toString('base64url');
  const address = deriveAddress(xpub, 0, 'chipnet');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const headers = { origin: baseURL! };
  await mkdir('artifacts/screenshots', { recursive: true });
  try {
    const registration = await page.request.post('/api/auth/register', {
      headers,
      data: {
        email,
        password: 'Isolated-cancellation-browser-2026',
        storeName: 'Cancellation QA fixture',
      },
    });
    expect(registration.status()).toBe(200);
    expect(
      (
        await page.request.post('/api/store', {
          headers,
          data: { name: 'Cancellation QA fixture', xpub },
        })
      ).status(),
    ).toBe(200);
    const store = (
      await db.query(
        'SELECT s.id FROM stores s JOIN merchants m ON m.id=s.merchant_id WHERE m.email=$1',
        [email],
      )
    ).rows[0];
    await db.query(
      "INSERT INTO orders(id,store_id,capability_hash,title,reference,network,address,address_index,amount,expires_at) VALUES($1,$2,$3,'ISOLATED incorrect zero request',$4,'chipnet',$5,0,100000,now()+interval '1 hour')",
      [
        oldId,
        store.id,
        createHmac('sha256', secret).update(cap).digest('hex'),
        `RT-QA-${oldId.slice(0, 8)}`,
        address,
      ],
    );
    const unauthenticated = await browser.newContext();
    try {
      expect(
        (
          await unauthenticated.request.post(`/api/orders/${oldId}/cancel`, { headers, data: {} })
        ).status(),
      ).toBe(401);
      expect(
        (
          await unauthenticated.request.post(`/api/orders/${oldId}/cancel`, {
            headers: {
              ...headers,
              authorization: `Bearer ${cap}`,
              'idempotency-key': randomUUID(),
            },
            data: {},
          })
        ).status(),
      ).toBe(403);
    } finally {
      await unauthenticated.close();
    }
    expect(
      (
        await page.request.post(`/api/orders/${oldId}/cancel`, {
          headers: { origin: 'https://evil.invalid' },
          data: {},
        })
      ).status(),
    ).toBe(403);
    expect(
      (await page.request.post(`/api/orders/${oldId}/cancel`, { headers, data: {} })).status(),
    ).toBe(400);
    await page.goto(`/workspace/orders/${oldId}`);
    await page.getByRole('button', { name: 'Cancel payment request', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(
      '100,000 satoshis (0.00100000 BCH), receive index 0',
    );
    await page.screenshot({
      path: 'artifacts/screenshots/cancel-dialog-desktop.png',
      fullPage: false,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const cancellationBounds = await page.getByRole('dialog').boundingBox();
    expect(cancellationBounds!.x).toBeGreaterThanOrEqual(16);
    expect(cancellationBounds!.y).toBeGreaterThanOrEqual(16);
    expect(cancellationBounds!.x + cancellationBounds!.width).toBeLessThanOrEqual(374);
    await page.screenshot({ path: 'artifacts/screenshots/cancel-dialog-mobile.png' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Cancel payment request', exact: true }),
    ).toBeFocused();
    await page.getByRole('button', { name: 'Cancel payment request', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm cancellation', exact: true }).click();
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
    const saved = (
      await db.query('SELECT address,address_index,amount,state FROM orders WHERE id=$1', [oldId])
    ).rows[0];
    expect(saved).toEqual({ address, address_index: 0, amount: '100000', state: 'cancelled' });
    const customer = await browser.newContext();
    try {
      const checkout = await customer.newPage();
      await checkout.goto(`${baseURL}/pay/${oldId}#access=${cap}`);
      await expect(checkout.getByText('Cancelled', { exact: true })).toBeVisible();
      await expect(checkout.getByRole('button', { name: 'Prepare payment' })).toHaveCount(0);
      expect(
        (
          await customer.request.post(`/api/orders/${oldId}/prepare`, {
            headers: {
              ...headers,
              authorization: `Bearer ${cap}`,
              'idempotency-key': randomUUID(),
            },
            data: { source: { xpub, changeXpub: xpub, changeIndex: 0, indices: [0] } },
          })
        ).status(),
      ).toBe(409);
    } finally {
      await customer.close();
    }
    await page.getByRole('link', { name: 'Create corrected request', exact: true }).click();
    await expect(page.getByLabel('Amount in satoshis', { exact: true })).toHaveValue('10000');
    await page.getByRole('button', { name: 'Review payment request', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('10,000 satoshis = 0.00010000 BCH');
    await expect(page.getByRole('dialog')).toContainText('Receive index 1');
    const expected = deriveAddress(xpub, 1, 'chipnet');
    await expect(page.getByRole('dialog')).toContainText(expected);
    await page.screenshot({
      path: 'artifacts/screenshots/correction-review-desktop.png',
      fullPage: false,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const reviewBounds = await page.getByRole('dialog').boundingBox();
    expect(Math.abs(reviewBounds!.x + reviewBounds!.width / 2 - 195)).toBeLessThan(2);
    await page.screenshot({ path: 'artifacts/screenshots/correction-review-mobile.png' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    // Simulate a lost HTTP response after a genuine localhost commit. Retrying
    // must recover the same capability and address, not create a second order.
    let dropped = false,
      savedCapability = '';
    await page.route('**/api/orders', async (route) => {
      if (!dropped && route.request().method() === 'POST') {
        dropped = true;
        const response = await route.fetch();
        expect(response.status()).toBe(200);
        savedCapability = (await response.json()).capability;
        await route.abort('failed');
      } else await route.continue();
    });
    await page.getByRole('button', { name: 'Create private payment request', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
    expect(
      (await db.query('SELECT count(*) FROM orders WHERE store_id=$1', [store.id])).rows[0].count,
    ).toBe('2');
    await page.getByRole('button', { name: 'Create private payment request', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Ready for your customer.' })).toBeVisible();
    const privateLink = await page
      .getByLabel('Private customer purchase link', { exact: true })
      .inputValue();
    expect(privateLink).toMatch(/\/pay\/[\w-]+#access=[\w-]{43}$/);
    expect(new URL(privateLink).hash).toBe(`#access=${savedCapability}`);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy private customer link', exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(privateLink);
    const newId = new URL(privateLink).pathname.split('/').pop()!;
    const created = (
      await db.query('SELECT address,address_index,amount FROM orders WHERE id=$1', [newId])
    ).rows[0];
    expect(created).toEqual({ address: expected, address_index: 1, amount: '10000' });
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['tablet', 768, 1024],
      ['mobile', 390, 844],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.screenshot({
        path: `artifacts/screenshots/corrected-link-${name}.png`,
        fullPage: true,
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page
          .getByLabel('Private customer purchase link')
          .evaluate((el) => el.scrollHeight <= el.clientHeight + 2),
      ).toBe(true);
    }
    await page.goto('/workspace');
    const history = await page.request.get('/api/workspace');
    const body = await history.json();
    expect(body.orders.find((o: { id: string }) => o.id === oldId).state).toBe('cancelled');
    expect(JSON.stringify(body)).not.toContain(new URL(privateLink).hash.slice(8));
    expect(errors).toEqual([]);
  } finally {
    await db.end();
  }
});
