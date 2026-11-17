import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import * as fontkit from 'fontkit';
const font = fontkit.create(
  await readFile(
    'node_modules/@fontsource-variable/rethink-sans/files/rethink-sans-latin-wght-normal.woff2',
  ),
);
function lettering(text, x, y, size, weight, color, tracking = -0.03) {
  const face = font.getVariation({ wght: weight }),
    layout = face.layout(text);
  let cursor = 0;
  const paths = layout.glyphs
    .map((g, i) => {
      const p = layout.positions[i],
        path = `<path transform="translate(${cursor + p.xOffset} ${p.yOffset})" d="${g.path.toSVG()}"/>`;
      cursor += p.xAdvance + tracking * font.unitsPerEm;
      return path;
    })
    .join('');
  return `<g fill="${color}" transform="translate(${x} ${y}) scale(${size / font.unitsPerEm} ${-size / font.unitsPerEm})">${paths}</g>`;
}
await mkdir('public/brand/licenses', { recursive: true });
const icon = await readFile('public/icon.svg');
for (const [name, size] of [
  ['favicon-32', 32],
  ['apple-touch-icon', 180],
  ['app-icon-192', 192],
  ['app-icon-512', 512],
])
  await sharp(icon).resize(size, size).png().toFile(`public/${name}.png`);
for (const name of ['mark-dark', 'mark-light'])
  await sharp(await readFile(`public/brand/${name}.svg`))
    .resize(512)
    .png()
    .toFile(`public/brand/${name}.png`);
for (const [name, bg, fg] of [
  ['wordmark-dark', 'none', '#2e1c36'],
  ['wordmark-light', 'none', '#ffffff'],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="100" viewBox="0 0 380 100"><title>ReturnTail wordmark</title><rect width="380" height="100" fill="${bg}"/><g transform="translate(0 10) scale(2)" fill="none" stroke="${fg}" stroke-linecap="square"><path d="M10 30V10h10a8 8 0 0 1 0 16h-7m7 0 10 9" stroke-width="5"/><path d="M20 17l-7 7 7 7" stroke-width="4"/></g>${lettering('returntail', 87, 74, 65, 650, fg, -0.04)}</svg>`;
  await writeFile(`public/brand/${name}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`public/brand/${name}.png`);
}
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><title>ReturnTail — Make it right. Make it verifiable.</title><rect width="1200" height="630" fill="#f3bc53"/>${lettering('returntail', 72, 110, 40, 650, '#2e1c36', -0.04)}${lettering('Make it right.', 68, 285, 92, 550, '#2e1c36')}${lettering('Make it verifiable.', 68, 385, 92, 550, '#2e1c36')}${lettering('Merchant-authorized Bitcoin Cash refunds. A clear chain of proof.', 72, 525, 24, 450, '#2e1c36', 0)}<path d="M75 566H1125" stroke="#2e1c36" stroke-width="1"/></svg>`;
await writeFile('public/brand/social.svg', social);
await sharp(Buffer.from(social)).png().toFile('public/brand/social.png');
await copyFile(
  'node_modules/@fontsource-variable/rethink-sans/LICENSE',
  'public/brand/licenses/rethink-sans-OFL.txt',
);
await copyFile(
  'node_modules/@fontsource-variable/manrope/LICENSE',
  'public/brand/licenses/manrope-OFL.txt',
);
await writeFile(
  'public/brand/provenance.json',
  JSON.stringify(
    {
      origin:
        'Original ReturnTail vectors rendered by scripts/brand-assets.mjs; no generated or stock raster artwork',
      palette: { saffron: '#f3bc53', plum: '#2e1c36' },
      note: 'Rethink Sans OFL lettering outlined from the exact self-hosted font with Fontkit; wordmark weight650, headline550. App body uses Manrope OFL.',
    },
    null,
    2,
  ),
);
console.log('Created original SVG/PNG mark, wordmark, icons and 1200×630 social image.');
