# ReturnTail engineering preview

This is a **45-second local application preview**, not a funded mainnet demonstration. Every product image is a genuine Playwright capture from an explicitly isolated QA account. No wallet approval, broadcast, confirmation or customer result is fabricated.

The proof-driven final narration/storyboard is in `../docs/VIDEO_SCRIPT.md`. Final hackathon demo footage requires the genuine funded-wallet verification gate and official duration verification. The preview is silent by design; there is no unlicensed audio.

Source uses pinned Remotion 4.0.541 and the already installed `~/hackathon-video-studio` dependencies. In this workspace, `video/node_modules` is an ignored symlink to that existing workspace; the dependency declaration here makes a clean install reproducible elsewhere.

From video/: `npm run studio`, `npm run render`. Render output: `../artifacts/video/ReturnTail-preview.mp4`. Use Remotion's bundled browser (no browser override). PNG captures and original mark/OFL Rethink font are copied into ignored `video/public/` by the preparation script. The shared workspace is not modified.
