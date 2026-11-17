import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  executablePath:
    '/home/sopski/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell',
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://localhost:3003/ReturnTailPreview?frame=90', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'artifacts/video/studio-preview.png' });
  console.log({
    title: await page.title(),
    studioLoaded: (await page.locator('body').innerText()).includes('ReturnTailPreview'),
  });
} finally {
  await browser.close();
}
