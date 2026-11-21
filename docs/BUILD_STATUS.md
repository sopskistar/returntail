# Build status

## Current verified capabilities — November 20, 2026

The safety code milestone is `da3afbc`, deployed to Vercel as `returntail-4lcj1sqqv-sopskistars-projects.vercel.app` (`dpl_6E2gbzriiW7m7n3WkY459UUPQmCP`). Build logs confirm checksum/no-op migration at 08:37:30 UTC and deployment at 08:38:02 UTC. Expanded hosted smoke passed **19/19** at 08:46:50 UTC after separately retained transient fetch failures. Authenticated production reconciliation returned HTTP200 with zero entries and did not broadcast.

The frontend follow-up preserves branding/architecture and gives `/guide` a hypothetical damaged-item story, puts physical-wallet preflight before the workflow, removes stale presentation/donation copy, and fixes auth-trail containment at 834px, narrow 320px navigation and measured control/text contrast. Typecheck/lint, 34 unit tests, optimized build and 12 browser tests pass; final browser run32.1s. The unchanged backend's 42 PostgreSQL integration tests pass. All fixture tests remain localhost-only. Final visual audit and deployed frontend SHA are recorded below after verification.

Still unverified: installed Paytaca/Selene sessions and signatures, merchant address control through the physical-wallet preflight, actual customer payment, partial refund, real excess-approval rejection and confirmed public-safe receipt. No BCH transfer was automated. `WIDGET_FACTORY_URL` awaits the public Google Slides link. `PUBLIC_PROOF_REFUND_ID` remains absent until genuine, independently confirmed refund evidence exists. Registration/roll-call/Telegram and official video rules require participant confirmation.

## Payment and form safety — November 20, 2026

New requests skip a bounded window of addresses with existing history; mainnet checks both providers. The existing audit trail records the freshness check atomically with allocation. Legacy requests without that record fail closed for review; no historical check is fabricated. Receive indices are displayed for physical-wallet matching. Source: `src/server/service.ts`, `chain.ts`, client types and order review.

Authentication forms now use POST fallbacks and disable submission until hydration, preventing credentials from falling into GET query strings. Other forms use POST; wallet connect buttons cannot implicitly submit their parent form. The hosted test discovered this boundary using an unused diagnostic credential, which was discarded. No funded account credential was involved. A scriptless navigation is correctly rejected by CSRF or content-type checks while keeping credentials out of URLs.

Checks on the optimized localhost artifact: typecheck and lint pass; 34 unit tests, 42 isolated PostgreSQL tests and 12 browser tests pass (final browser run 43.9s). Local browser creation checks real Chipnet address-history absence for an isolated, unfunded test key; confirmed transaction/signing fixtures remain explicitly isolated test data. The initial fallback test over-specified a 415 response; it now verifies the legitimate 403/CSRF or 415/content-type boundary, POST method and empty URL query. No production fixture data or automated transfers.

Production verification at 07:50 UTC checked secure session cookies, durable profile read/write, reload/login/logout and genuine WizardConnect QR creation/cancellation without a wallet response. One clearly labeled operational verification account/store remains, with zero financial records; the successful session was signed out. Earlier abandoned sessions expire under the seven-day policy. Runtime network evidence is in MAINNET_PROOF.md. Device/address preflight, real signatures, payment/refund and confirmed safe receipt remain pending.

## Production repair — November 20, 2026

`9c1e00e` deployed as `returntail-haznldwbk-sopskistars-projects.vercel.app`. Vercel build logs prove the Neon migration applied atomically at 07:17:32 UTC and Next.js deployment completed at 07:18:11 UTC. Public HTTPS smoke at 07:22 UTC passed 11/11 checks, including mainnet/database/configured health and unauthenticated workspace rejection. Individually decrypted settings were checked without disclosing values: canonical URL matches, mainnet is selected, authentication and cron secrets meet minimum lengths, and the donation setting has a BCH prefix. Token compatibility is checked separately by the application.

Operational hardening adds a cron-authenticated, read-only `/api/jobs/network` check using the actual runtime's TLS/checkpoint path and independent mainnet header witness; no signing, address lookup or transfer. Health requires the applied migration record; API errors are explicitly non-cacheable. Hosted smoke now checks security headers, private caching, CSRF/origin rejection and unauthenticated order/job access, and handles non-JSON failures honestly. Verified locally: typecheck/lint, 33 unit tests (including 5 isolated network-readiness failure checks), 36 PostgreSQL tests and optimized build. Live network readiness from the Vercel runtime remains to be executed after this milestone deploys.

Baseline `3c5c493` matches remote main and the existing Vercel production deployment `dpl_DsqchYsHFMjXoNEnQwsBdnJNh2ZS`. That deployment built successfully but used framework Other, producing Vercel NOT_FOUND at `/api/health`. Environment key inventory confirms Neon configuration, authentication, canonical URL, network, cron and donation settings are present; secret values have not been printed. `WIDGET_FACTORY_URL` and `PUBLIC_PROOF_REFUND_ID` remain absent.

Deployment configuration now explicitly selects Next.js and applies the checksum-verified migration during production builds. No application architecture change. Verified before this milestone: typecheck, lint, 28 unit tests, 36 isolated localhost PostgreSQL tests, local migration checksum/no-op, optimized build and secret scan. npm audit reports zero vulnerabilities. A generated Webpack cache failure was resolved by moving the cache aside and completing a clean build. Hosted runtime, migration and physical wallets remain pending until checked after deployment. No production fixture tests or BCH transfers executed.

## Archived implementation baseline — November 17, 2026

Implementation source checked through `06b83de`; final handoff/documentation commit is recorded in the release manifest/conversation. Baseline `b6f2fe5`. No milestone below claims a funded wallet result from a fixture.

| Gate                                       | Implemented and actually checked                                                                                                                                                                                 | Commit(s)                               | Outstanding manual / external gate                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M0 research, differentiation, architecture | Official BCH/WizardConnect/Mainnet.cash/Paytaca references and competition site researched; registry versions inspected and pinned; required research/product/architecture docs written                          | `f970c0a`                               | DoraHacks returned 405; participant must revalidate rules/deadline/eligibility                          |
| M1 genuine wallet/network layer            | Official SDK QR creation/cancellation exercised in browser; real BCH construction/signature/VM tests; live Chipnet/mainnet fork checkpoints; merkle proof and two-provider agreement on unrelated public tx      | `f970c0a`, `45748e2`                    | Actual Paytaca handshake/reconnect/refusal/funded signing; Selene compatibility                   |
| M2 merchant/data/orders/payment            | Scrypt login, server sessions, store/public-key setup, unique-address requests, private capabilities and real network payment-verification code; PostgreSQL migration and production-mode localhost flow checked | `45748e2`, `1db3218`                    | Actual customer wallet payment; hosted Neon verification                                          |
| M3 refund/decision/settlement              | Real request/decision/signing-intent code, VM validation, durable signed bytes, broadcast/observation states, safe receipts; actual UI request/approval tested with isolated chain fixture                       | `45748e2`, `1db3218`                    | Merchant wallet signature, live refund and confirmed app receipt                                  |
| M4 accounting/security                     | 28 core +36 PostgreSQL integration +11 browser tests pass; locks, conditional balances, idempotency, unique identities, rollback, reconciliation and identical-byte recovery checked                             | `45748e2`, `1db3218`                    | Independent security review and funded-wallet manual gate                                         |
| M5 premium interface/QA                    | Original SVG/PNG identity and outlined licensed fonts; responsive app/receipt routes; actual desktop/tablet/mobile captures; Hallmark static0 FAIL/0 REFLEX; independent review ship and named fixes remeasured  | `1db3218`                               | Full screen-reader/zoom matrix and physical-wallet states                                         |
| M6 production preparation                  | Atomic migration and repeated checksum/no-op verified locally; typecheck/lint/build pass; optimized localhost smoke11/11; secret scan pass and audit0                                                            | `45748e2`, `1db3218`                    | Secure Neon/Vercel configuration, deploy authorization, public HTTPS smoke                        |
| M7 evidence/judging/video                  | Judge guide, compliance matrix, Widget Factory content, proof ledger and exact manual test; genuine45s engineering-preview MP4 rendered/decoded/inspected                                                         | `06b83de`, closing documentation commit | Real mainnet proof/footage, homepage values, eligibility and actual presentation/submission |

## Actual final commands and outcomes

| Command                                    | Outcome                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `npm install --no-fund`                    | Successful installation; exact root lock retained                                                               |
| `npm run typecheck`                        | PASS: `next typegen && tsc --noEmit`                                                                            |
| `npm run lint`                             | PASS, no warnings                                                                                               |
| `npm test`                                 | 28/28 pass                                                                                                      |
| `npm run test:integration`                 | 36/36 pass in dedicated PostgreSQL schema                                                                       |
| `npm run build`                            | PASS, supported Webpack path; no final compiler warnings                                                        |
| `npm run test:e2e`                         | 11/11 pass against the exact optimized localhost server; final run37.1s                                         |
| `npm run db:migrate`                       | Initial atomic application passed; repeated checksum verified/no-op                                             |
| `npm run smoke -- http://localhost:3001`   | 11/11 read-only checks pass; Chipnet/local DB readiness                                                         |
| `node scripts/capture.mjs --app-only`      | Six size pairs; final `problems: []`; actual captures inspected                                                 |
| `npm run proof:network -- mainnet --probe` | Live checkpoint, tx identity, merkle/witness agreement on unrelated public transaction; not an app transfer     |
| `npm run scan:secrets`                     | PASS; heuristic only                                                                                            |
| `npm audit --audit-level=low`              | 0 vulnerabilities reported                                                                                      |
| Hallmark static / Impeccable detector      | Static0 FAIL/0 REFLEX/7 adjudicated WARN; detector `[]`. Puppeteer render/overlay not executed; Playwright used |
| Video render / FFprobe / FFmpeg            | Style proof inspected;45s1080p30 H.264 rendered; complete decode clean; all five scenes inspected               |

Failure history is retained in SECURITY_TESTS.md and VISUAL_QA.md: font paths, WASM CSP, sandbox/Turbopack workers, development cold compilation, fixture-key collision, old witness timeout and a scan-directory edge case were corrected. Relevant checks were rerun successfully.

Files: `src/core/` BCH logic; `src/client/` and wallet provider; `src/server/`; API/routes `src/app/`; `migrations/`; `tests/`; original identity `public/brand/`; editable preview `video/`; manual gates `docs/OWNER_CHECKLIST.md`.

At the November 17 handoff, production deployment was **not verified**. There was **no ReturnTail mainnet payment/refund txid**. Mainnet funds were never spent automatically. Required human actions are consolidated in OWNER_CHECKLIST.md; the entry is not yet Mainnet Track ready.

## Final frontend review

`a6382f3` — fix: clarify refund journey and improve responsive accessibility. Typecheck/lint/build,34 unit tests and12 browser tests pass (last full browser run32.1s); unchanged backend integration tests42/42. Actual Hallmark final-v2 render:0 FAIL,2 documented/adjudicated REFLEX,4 WARN; Impeccable151 nonblocking token advisories. Independent screenshots and keyboard checks were executed; the overlay was blocked by intentional CSP and is not claimed. Details: VISUAL_QA.md.

## Explorer-route correction

A real HTTP check found the old mainnet root `/tx/` URL returned404. The explorer's own network directory identifies explicit network paths; `/mainnet/tx/f19727e987b0f1d3c2caf62ea5ff340af1ec0c128674d5779f965cc223d9ea53` returned200 with the correct transaction title. It is the unrelated public transaction already labeled in MAINNET_PROOF, not an app payment. `src/core/bch.ts` now includes the explicit network for both mainnet and Chipnet receipt links. Added a network-route regression in tests/core.test.ts. Typecheck/lint and35 unit tests pass; optimized build passed. Total automated coverage is now89 tests when combined with the unchanged42 PostgreSQL and12 browser checks.

Final code hosted smoke: 19/19 at 2026-11-20T16:11:44.390Z. Production registration/session/profile/QR cancellation was rechecked at09:22:59 UTC with zero browser errors and no financial records. Production environment inventory reconfirmed both WIDGET_FACTORY_URL and PUBLIC_PROOF_REFUND_ID absent. Final npm audit reports0 vulnerabilities, secret scan passes across126 candidate files, and local Markdown links have no missing targets. Hosted render transport limitations are retained in VISUAL_QA rather than described as clean runs. The documentation-only closing commit does not claim a funded wallet result; final deployed SHA is confirmed from Vercel metadata in the handoff.

## November 20 — Paytaca v0.27.3 index-zero safety correction

Real user report: Paytaca connects and the merchant public key/request persist on production; Samsung S24 Ultra, Paytaca v0.27.3. No funds transferred. Release source reserves native receive 0/0 for encryption and hides zero in Receive. ReturnTail's chain derivation is consistent, but using zero was incompatible with native address inspection. Exact destination control remains **unverified; funded journey stopped**.

Implemented: new allocations start at one; existing requests/keys/capabilities are not changed. Server blocks new preparation and first signed submission for zero while retaining saved-byte recovery/reconciliation. Browser-only receive comparison detects later indices, network/encoding/account differences without uploading addresses or claiming ownership. Added `/wallet-check`, merchant request comparison, funding-pause UI and corrected physical-wallet instructions. No migration, production record mutation or funds movement.

Checks for this milestone: unit tests 38/38; isolated PostgreSQL 45/45 (initial fixture adjustment exposed two fixture issues, corrected and rerun); typecheck and lint pass. Optimized build checked separately in the final release ledger. Added tests prove preserved records, blocked unsigned zero flows, positive allocation, exact saved-byte recovery, token-aware normalization, bounded search and cancellation. Physical Paytaca comparison and Selene pairing/signing remain manual gates. Details: [address preflight](WALLET_ADDRESS_PREFLIGHT.md).
