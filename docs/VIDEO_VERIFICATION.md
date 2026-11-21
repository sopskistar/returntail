# Engineering-preview video verification

Output: `artifacts/video/ReturnTail-preview.mp4` (local artifact, not automatically published).

- 45.000 seconds; 1920×1080; 30 fps; H.264; yuv420p; 3,319,273 bytes at final render.
- Rendered through pinned Remotion 4.0.541 with the existing shared Hackathon Video Studio tooling and its bundled renderer browser. No redundant Remotion install or browser override.
- Remotion Studio loaded the named composition in the installed headless Playwright browser. A style-proof frame was rendered and inspected before final rendering.
- FFprobe checked codec, dimensions, frame rate and duration. FFmpeg decoded the entire final MP4 to a null sink with no decode errors.
- A contact sheet covering all five scenes was inspected. Its unused sixth tile is a contact-sheet layout remainder, not a black video scene. Title, actual workspace/purchase captures, workflow explanation and final human gate were visible.
- Source is in `video/src/`; exact package dependencies are declared in `video/package.json`; original/OFL assets documented in video/README.md and brand notices.
- Silent by design; no unlicensed music, fabricated voice or paid API. Full narration and mainnet recording plan are in VIDEO_SCRIPT.md.

At the time this historical preview was rendered, its slate said “local application/no funds/mainnet proof pending.” That is a statement about the captured QA footage and its export date; the creator later reported completing a physical-wallet mainnet journey. Product images are genuine Playwright captures of isolated QA accounts. The state diagram is an explanation, not a staged wallet interaction. **This is not a final hackathon mainnet demonstration.** It must not be submitted as such; a final film needs independently reconciled chain evidence and genuine current application captures.
