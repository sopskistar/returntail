# Release verification — November 20, 2026

ReturnTail continues the existing main branch and architecture. The production application is https://returntail.vercel.app. No mainnet payment or refund has been executed; physical wallets and funded settlement remain a manual verification gate.

## Working on Vercel

The original deployment built Next.js but was configured as Other and served only public assets, returning Vercel NOT_FOUND for application routes. Commit `9c1e00e` explicitly selected Next.js and a production build migration gate. Vercel logs prove Neon migration applied atomically at 07:17:32 UTC. The safety deployment at `da3afbc` subsequently verified the existing migration checksum and deployed at 08:38:02 UTC.

Actual HTTPS checks exercised registration, password login, secure/HttpOnly/SameSite=Lax cookies, a persisted store profile change, reload, logout and denied workspace access. A genuine WizardConnect QR/URI was generated and cancelled with no physical-wallet response. One clearly labeled operational verification account/store remains; no orders, receiving keys, payments or refunds were seeded in production. The successful session was signed out; abandoned sessions expire under the seven-day policy.

The protected Vercel runtime network check connected using TLS and validated BCH checkpoints plus primary/witness header agreement on mainnet at height 978134. That is infrastructure evidence, not an app transfer. Details are in [MAINNET_PROOF](MAINNET_PROOF.md).

## Executed verification

| Check | Result |
| --- | --- |
| Type generation/typecheck | PASS |
| ESLint | PASS |
| Unit/cryptographic/provider-fixture tests | 35 passed |
| PostgreSQL integration tests | 42 passed, isolated localhost schema only |
| Optimized production build | PASS; actual Vercel builds and local Webpack artifact checked |
| Localhost browser tests | 12 passed, including credential fallback, 320px navigation and 834px containment |
| Hosted API/page/security smoke | 19/19 passed; final code check 2026-11-20T16:11:44.390Z (see BUILD_STATUS) |
| Migration | Atomic application on Neon; later checksum/no-op in actual build log |
| Secret scan | PASS, heuristic only |
| npm dependency audit | 0 vulnerabilities reported |
| Local Markdown links | No missing local targets |

Confirmed transaction/signing data in automated tests are isolated fixtures. Browser order allocation additionally checks real read-only Chipnet history for an unfunded test key. No automated production-money transfer or destructive production database test occurred. Initial hosted smoke had transient fetch failures; a separate retry passed 19/19. Initial browser resource failures were not accepted as visual QA; captures were repeated with styles/fonts loaded.

## Visual verification

Independent Impeccable design/browser assessments and actual Hallmark renders were completed. Final render:0 FAIL,2 documented/adjudicated REFLEX,4 WARN; its exit remains1. The CLI detector reports151 token advisories, not a clean zero. Tablet containment, narrow navigation and measured text/input contrast were refined. The overlay was blocked by intended CSP and is not claimed. Fifteen hosted page captures completed with no overflow or JavaScript page errors;12 browser ERR_NETWORK_CHANGED console events and an earlier failed navigation are retained as transport limitations. A separate HTTPS account/QR check completed with zero browser errors. See [VISUAL_QA](VISUAL_QA.md).

## Security fixes and limits

- Previously used receiving addresses could expose historical matching payments to new orders. New allocation skips existing history at both mainnet providers, records freshness atomically under the store lock, and refuses legacy requests without a genuine check. Six additional PostgreSQL cases verify rollback, idempotency, concurrency and legacy rejection; witness-only history has a separate provider test.
- Before hydration, a form could fall back to GET and put an unused diagnostic credential in a URL. That credential was discarded without registration. Auth forms now disable submission until hydration and use POST fallbacks; scriptless posts are rejected without URL credentials. Wallet buttons cannot submit a store form.
- Health requires the migration record. API responses, including errors, are non-cacheable. An authenticated read-only network check verifies outbound runtime capability without signing/broadcasting. CSRF and unauthorized workspace/order/job access were checked on production.
- Existing row locks, reservations, idempotency, unique transaction identities, saved signed bytes before broadcast and identical-byte recovery remain in place. Unknown outcomes keep reservations. These controls do not prevent extra merchant transfers outside ReturnTail.
- This is provider-assisted BCH verification, not a fully validated proof-of-work node. General availability still needs independent security review, private support/retention/account-recovery policy and broader screen-reader testing.

A final link check found the explorer root `/tx/` route returning404. The actual explicit `/mainnet/tx/` route returned200 and identified the previously verified unrelated public transaction. Receipt links now always include their network; a regression test covers mainnet/chipnet separation. This remains infrastructure/link verification, not an app transfer.

## Physical wallet gate

Use the [exact preflight and transfer steps](OWNER_CHECKLIST.md) and [reviewed compatibility](WALLET_READINESS.md). Paytaca v0.27.3 and Selene 2026.10.02 have compatible released source implementations, but installed binary pairing, reconnection, refusal and signing remain unverified. Exclude Paytaca v0.26.1 because it broadcasts despite the sign-only flag.

You can begin the unfunded device preflight. Before any funds move, compare the complete merchant receiving address and index with Paytaca's own address view. A connection/xpub is not ownership proof. Proceed to the authorized purchase and partial refund only after both wallets pass. Do not retry unknown transactions with new inputs. The checklist specifies how to demonstrate a genuine 4,000-sat approval and 7,000-sat excess rejection against an example 10,000-sat purchase without an extra transfer.

## Evidence and submission

`PUBLIC_PROOF_REFUND_ID` remains unset. No ReturnTail payment txid, refund txid or confirmed settlement is claimed. After genuine wallet actions, independently verify both transactions, amounts/outputs, block evidence and safe receipt before updating the ledger or public proof setting.

The CashTokens donation address is configured and format-validated. `WIDGET_FACTORY_URL` remains pending your publicly viewable Google Slides presentation. The guide/script lead with a hypothetical damaged-item problem, then the mechanism, then actual evidence; no fictional customers or transaction records were added. No separate presentation app or new video was built.

The supplied cutoff is November 22, 2026, 14:00 UTC; the official site confirms hacking ends then. DoraHacks detail/resources remain inaccessible to automated checks. Registration, roll-call, Telegram verification, exact submission/video rules and useful-mainnet proof must still be confirmed. No submission or announcement was published.

## Git milestones

- `9c1e00e` — fix: deploy Next.js routes and migrate production Neon safely
- `5a67a44` — fix: verify hosted BCH readiness and harden API smoke checks
- `da3afbc` — fix: prevent historical payment reuse and unsafe form submits
- `a6382f3` — fix: clarify refund journey and improve responsive accessibility
- `b86e36a` — fix: use verified network-specific BCH explorer links

Subsequent UI/report commits and the final deployed SHA are recorded in BUILD_STATUS and the final handoff. History is preserved without squash, rewrite or force push.
