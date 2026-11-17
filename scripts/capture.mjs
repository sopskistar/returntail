import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const base = process.env.RETURNTAIL_QA_URL ?? 'http://localhost:3001';
await mkdir('artifacts/screenshots', { recursive: true });
await mkdir('.impeccable/review', { recursive: true });
const existing =
  '/home/sopski/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: existing }),
});
const problems = [];
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['hero', 1280, 800],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
  ['small-mobile', 375, 812],
  ['landscape', 844, 390],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => problems.push({ name, error: e.message }));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/screenshots/${name}.png`, fullPage: true });
  if (['desktop', 'mobile', 'tablet'].includes(name))
    await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  if (overflow) problems.push({ name, error: 'horizontal overflow' });
  await page.goto(`${base}/register`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `artifacts/screenshots/register-${name}.png`, fullPage: true });
  await page.close();
}
// Public reference captures only; none of their assets enter the app.
for (const [name, url] of process.argv.includes('--app-only')
  ? []
  : [
      ['framer-montra', 'https://montra.framer.media'],
      ['beui', 'https://beui.dev'],
      ['21st', 'https://21st.dev'],
    ]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.screenshot({ path: `artifacts/screenshots/reference-${name}.png` });
  } catch (e) {
    problems.push({ reference: name, error: e.message });
  }
  await page.close();
}
await browser.close();
await writeFile('artifacts/screenshots/report.json', JSON.stringify({ base, problems }, null, 2));
console.log(JSON.stringify({ base, problems }, null, 2));
