import { test, expect } from '@playwright/test';

test('auth forms cannot leak credentials through a pre-hydration GET', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const route of ['/register', '/login']) {
      await page.goto(`${baseURL}${route}`);
      const form = page.locator('form');
      await expect(form).toHaveAttribute('method', 'post');
      await expect(page.getByRole('button', { name: route === '/register' ? 'Create merchant account' : 'Sign in', exact: true })).toBeDisabled();
      await expect(page.getByText('Loading secure sign-in. JavaScript must be enabled.')).toBeVisible();
      await page.getByLabel('Email address', { exact: true }).fill('isolated-no-script@returntail.invalid');
      await page.getByLabel('Password', { exact: true }).fill('Isolated-not-a-real-password');
      // Enter/form.submit must still POST if a browser submits without hydration.
      const responsePromise = page.waitForResponse(r => r.url().includes('/api/auth/'));
      await form.evaluate((element: HTMLFormElement) => element.submit());
      const response = await responsePromise;
      expect(response.request().method()).toBe('POST');
      expect(new URL(response.url()).search).toBe('');
      // Navigation POSTs can omit/null their Origin under privacy policies.
      // Either boundary must reject before authentication; credentials stay out of URLs.
      expect([403, 415]).toContain(response.status());
      expect((await response.json()).error).toBe(
        response.status() === 403 ? 'CSRF_REJECTED' : 'CONTENT_TYPE',
      );
    }
  } finally { await context.close(); }
});
