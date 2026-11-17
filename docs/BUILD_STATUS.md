# Build status — November 17, 2026

Implementation source checked through `06b83de`; final handoff/documentation commit is recorded in the release manifest/conversation. Baseline `b6f2fe5`. No milestone below claims a funded wallet result from a fixture.

| Gate                                       | Implemented and actually checked                                                                                                                                                                                 | Commit(s)                               | Outstanding owner / external gate                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M0 research, differentiation, architecture | Official BCH/WizardConnect/Mainnet.cash/Paytaca references and competition site researched; registry versions inspected and pinned; required research/product/architecture docs written                          | `f970c0a`                               | DoraHacks returned 405; owner must revalidate rules/deadline/eligibility                          |
| M1 genuine wallet/network layer            | Official SDK QR creation/cancellation exercised in browser; real BCH construction/signature/VM tests; live Chipnet/mainnet fork checkpoints; merkle proof and two-provider agreement on unrelated public tx      | `f970c0a`, `45748e2`                    | Actual Paytaca handshake/reconnect/refusal/funded signing; Selene compatibility                   |
| M2 merchant/data/orders/payment            | Scrypt login, server sessions, store/public-key setup, unique-address requests, private capabilities and real network payment-verification code; PostgreSQL migration and production-mode localhost flow checked | `45748e2`, `1db3218`                    | Actual customer wallet payment; hosted Neon verification                                          |
| M3 refund/decision/settlement              | Real request/decision/signing-intent code, VM validation, durable signed bytes, broadcast/observation states, safe receipts; actual UI request/approval tested with isolated chain fixture                       | `45748e2`, `1db3218`                    | Merchant wallet signature, live refund and confirmed app receipt                                  |
| M4 accounting/security                     | 28 core +36 PostgreSQL integration +11 browser tests pass; locks, conditional balances, idempotency, unique identities, rollback, reconciliation and identical-byte recovery checked                             | `45748e2`, `1db3218`                    | Independent security review and funded-wallet manual gate                                         |
| M5 premium interface/QA                    | Original SVG/PNG identity and outlined licensed fonts; responsive app/receipt routes; actual desktop/tablet/mobile captures; Hallmark static0 FAIL/0 REFLEX; independent review ship and named fixes remeasured  | `1db3218`                               | Full screen-reader/zoom matrix and physical-wallet states                                         |
| M6 production preparation                  | Atomic migration and repeated checksum/no-op verified locally; typecheck/lint/build pass; optimized localhost smoke11/11; secret scan pass and audit0                                                            | `45748e2`, `1db3218`                    | Secure Neon/Vercel configuration, deploy authorization, public HTTPS smoke                        |
| M7 evidence/judging/video                  | Judge guide, compliance matrix, Widget Factory content, proof ledger and exact owner test; genuine45s engineering-preview MP4 rendered/decoded/inspected                                                         | `06b83de`, closing documentation commit | Real mainnet proof/footage, owner homepage values, eligibility and actual presentation/submission |

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

Files: `src/core/` BCH logic; `src/client/` and wallet provider; `src/server/`; API/routes `src/app/`; `migrations/`; `tests/`; original identity `public/brand/`; editable preview `video/`; owner gates `docs/OWNER_CHECKLIST.md`.

Production deployment is **not verified**. There is **no ReturnTail mainnet payment/refund txid**. Mainnet funds were never spent automatically. Required human actions are consolidated in OWNER_CHECKLIST.md; the entry is not yet Mainnet Track ready.
