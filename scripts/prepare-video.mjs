import { mkdir, copyFile, symlink, access } from 'node:fs/promises';
await mkdir('video/public', { recursive: true });
await mkdir('artifacts/video', { recursive: true });
try {
  await access('video/node_modules');
} catch {
  await symlink('/home/sopski/hackathon-video-studio/node_modules', 'video/node_modules', 'dir');
}
for (const [from, to] of [
  ['artifacts/screenshots/workspace-desktop.png', 'workspace.png'],
  ['artifacts/screenshots/purchase-desktop.png', 'purchase.png'],
  ['public/brand/mark-dark.svg', 'mark-dark.svg'],
  ['public/brand/mark-light.svg', 'mark-light.svg'],
  [
    'node_modules/@fontsource-variable/rethink-sans/files/rethink-sans-latin-wght-normal.woff2',
    'rethink.woff2',
  ],
])
  await copyFile(from, `video/public/${to}`);
console.log(
  'Prepared genuine local QA captures, original vectors and licensed font for engineering preview. No funded-wallet footage exists.',
);
