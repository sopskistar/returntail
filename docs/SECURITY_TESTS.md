# Security verification

Automated fixtures are isolated. They do not establish actual wallet compatibility, mainnet execution or hosted security. The BCH tests use real transaction serialization, signatures and Libauth VM validation. Integration tests run against PostgreSQL 17, not an in-memory database.

Current audit run (November 21, 2026): **43 core/unit tests passed; 90 isolated PostgreSQL integration tests passed; 17 of 18 optimized-build browser tests passed**. The remaining browser case stopped before correction creation because its local fresh-address history check could not resolve the configured Chipnet provider (`EAI_AGAIN chipnet.imaginary.cash`, then timeout on retry). The test never reached funding or production; its cancellation UI state remained intact. The prior 18/18 browser result is retained below as a dated historical run. Production-mode browser fixture tests are localhost-only; no automated funded transfer is permitted.

| Required adversarial case        | Implemented assertion                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1 Invalid purchase transaction   | Parser and byte-derived txid mismatch rejected                                                      |
| 2 Wrong recipient                | No unique matching merchant output rejected                                                         |
| 3 Underpayment                   | Exact original recipient amount required                                                            |
| 4 Duplicate purchase evidence    | Unique `(network,txid,vout)` conflict asserted with SQL 23505                                       |
| 5 Missing transaction            | State remains awaiting; lost observations pause refunds                                             |
| 6 Wrong network                  | Address, xpub, provider observation and fork checkpoint boundaries                                  |
| 7 Invalid refund address         | CashAddress/script validation                                                                       |
| 8 Unauthorized merchant approval | Other merchant rejected; balance unchanged                                                          |
| 9 Other customer's receipt       | Wrong capability returns inaccessible purchase                                                      |
| 10 Above-original refund         | Amount rejected before reservation                                                                  |
| 11 Cumulative partial limit      | Second partial approval exceeding remainder rejected                                                |
| 12 Simultaneous approvals        | PostgreSQL row lock permits only valid aggregate                                                    |
| 13 Duplicate submission          | Same key returns one request/decision                                                               |
| 14 Replayed idempotency key      | Different body conflicts; wrong capability cannot reuse cached response                             |
| 15 Disconnect before signing     | No sign request is emitted                                                                          |
| 16 User rejects signing          | Rejection propagates without broadcast                                                              |
| 17 Broadcast failure             | Signed bytes/identity/reservation retained                                                          |
| 18 Broadcast timeout             | Unknown state prevents replacement/cancellation                                                     |
| 19 Duplicate notifications       | One payment row and one transition audit                                                            |
| 20 Database rollback             | Mutation, audit and idempotency all rolled back                                                     |
| 21 Reconciliation                | Saved attempt independently observed later and state updated                                        |
| 22 Confirmation/reorg            | Review state; settled accounting never reopens eligibility                                          |
| 23 Tampered receipt              | Wrong order/capability rejected                                                                     |
| 24 Malicious input/XSS           | Parameterized SQL keeps input as data; browser sees escaped text, no injected image/global          |
| 25 Rate limit                    | Persistent bucket enforces threshold                                                                |
| 26 Access-control bypass         | Unauthenticated APIs, cross-origin mutation, other merchant, receipt and signing endpoints rejected |

Additional assertions: exact BCH VM signatures, mandatory 0x61 flags, all signed inputs/outputs/change/version/locktime match the reviewed intent; conservative fee/debit accounting; unsigned-only cancellation; identical-byte-only rebroadcast after a successful network absence check; encrypted idempotency responses; secure session cookie attributes; actual SDK pairing URI and cancellation; mobile/tablet overflow, metadata, icons, security headers, custom 404.

## Mitigations and limits

- Parameterized SQL; Zod input validation and streaming body size cap; React escaping.
- Scrypt N=32768,r=8,p=3, 16-byte salt and 64-byte derived key. Random HttpOnly SameSite sessions; seven-day server-side expiry/revocation.
- Exact-origin JSON mutations; database-backed auth/API/order rate limits; no trusted client status changes.
- HMAC receipt capability hashes and AES-256-GCM encrypted idempotency responses. AUTH_SECRET stability/rotation needs operational care.
- TLS certificate validation, chain fork checkpoints, byte-derived transaction identities, merkle branch verification and mainnet witness agreement. This is public-provider-assisted verification, not a fully validated PoW node.
- CSP permits library WASM, uses no arbitrary eval in production, blocks objects/frames and cross-origin form actions. `unsafe-inline` remains for Next hydration and React styles; nonce-based tightening is future hardening. Development eval is limited to development.
- Public resolution receipts omit private reasons, account data and receipt capabilities. Blockchain addresses/transactions are public by nature.
- Secret-pattern scanning is heuristic. Dependency audit is a point-in-time advisory check, not an independent security audit.

## Manual gates

Actual Paytaca/Selene handshake, network selection, reconnection, signature refusal, successful signing and complete mainnet transfer require physical devices and explicit consent. Hosted Neon/Vercel migration, HTTPS cookie behavior and runtime BCH connectivity were separately verified on November 20. They are not established by local fixtures. Real confirmations, reorg/provider-outage operations, scheduled cron execution and full screen-reader coverage remain distinct manual/operational gates.

First browser attempts surfaced a WASM CSP error (fixed and retested), development cold-compile timing, and reused fixture xpub collisions (tests now derive per-run keys; store configuration returns an explicit registered-key error). An obsolete witness timed out; a maintained Electron Cash registry witness was tested instead. Failures are retained here rather than described as passes.

## November 20 production follow-up

- Production routing was corrected from static Other output to Next.js. The Vercel build log proves atomic Neon migration; health and real HTTPS authentication/profile persistence were then exercised. No fixture tests or seeded financial records touched production.
- A pre-hydration form submission exposed an unused diagnostic credential in a GET query. It was discarded without registering that credential. Authentication now uses a POST fallback and disables submission until hydration; other forms use POST and wallet buttons cannot submit their parent form. The JavaScript-disabled browser regression asserts POST, no URL query and exact fail-closed CSRF/content-type error.
- Previously used merchant wallet addresses could expose old matching-value payments to a new order. Allocation now checks both mainnet providers, skips any history and records freshness under the store lock. Missing checks/provider failure roll back; legacy requests cannot prepare or verify payment without a genuine allocation check. Historical markers are not backfilled. Six isolated PostgreSQL cases cover freshness, legacy rejection, rollback, idempotency and concurrent allocation; an additional provider fixture tests witness-only history.
- Integration fixture connections now reject non-local hostnames even if a test URL is explicitly configured. Browser fixture tests remain restricted to localhost. Their confirmed transaction data and signing keys are isolated fixtures, never app mainnet evidence.
- Physical Paytaca/Selene binary behavior, real signatures, unknown-outcome recovery on genuine transactions and funded settlement still require the documented manual gate. Source review excludes Paytaca v0.26.1 because it disregards sign-only broadcasting.

## November20 physical-address correction and inspection surfaces

Three PostgreSQL tests cover legacy zero-index funding refusal without record mutation, positive minimum allocation and recovery of identical saved bytes. Three core tests cover native-index discovery, network/script normalization including CashToken-aware encodings, invalid addresses and cancellation. Two unit tests retain explicit PostgreSQL hostname/certificate verification. Five browser tests cover the no-transaction player, actual local GET-only lab boundaries without cookies, isolated unavailable/unexpected HTTP fixtures, unfunded preflight and desktop/tablet/phone reduced motion. Existing financial invariants remain exercised by the unchanged settlement/concurrency cases.

Independent review found that generic success styling could show green for an unknown broadcast. Notices now distinguish neutral checks/application actions, warning pending/unknown transactions and confirmation green. This does not turn a pending response into settlement. Native address matching never persists or grants wallet ownership status. Lab private response bodies are canceled without rendering, and probes never call reconciliation.

The initial secret scan flagged a deliberately synthetic credential-shaped URL at a reserved `.invalid` host in the TLS unit test; no real credential existed. Its fixture now uses explicit URL fields, all40 unit tests pass, and the final scan passes. Source history was preserved. No production-money transfer or fixture reset was performed.

## November 21 — merchant cancellation and corrected requests

Cancellation uses merchant session authorization, exact-origin JSON mutations, strict input validation, idempotency, the existing order row lock and an atomic audit event. The original amount, destination, private capability and history are retained. Recorded payments, every signing attempt (including cancelled unsigned attempts), refunds, settled value and reservations block cancellation. An unavailable history provider aborts the operation; any detected history blocks cancellation for manual review.

The isolated PostgreSQL suite now covers cancellation replay and concurrent duplicate requests, customer/other-merchant denial, wrong-network denial, stale payment state, all eight attempt states, expired unpaid requests, provider failure rollback, prepare/cancel races in both orders, verify/cancel observation retention, sticky late-activity review, scheduled no-broadcast monitoring, encrypted correction retries, retired-address rejection, unused positive manual selection, preview rechecking, concurrent selected allocation and high-water preservation. Equivalent address encoding cannot bypass retirement of a recorded receiving index. Existing accounting, settlement, signed-byte recovery and public-receipt tests remain active.

The localhost browser flow creates a clearly isolated legacy index-zero fixture, exercises confirmation and Escape/focus restoration, checks the unchanged destination and amount after cancellation, rejects customer/unauthenticated/cross-origin/keyless cancellation, confirms the cancelled customer page has no payment preparation, reviews a 10,000-satoshi / 0.00010000 BCH correction at index 1, and copies its complete private link. A deliberately dropped HTTP response after a genuine local commit verifies that retry recovers the same capability and address. Desktop/tablet/phone checks cover containment and the full link. These are local tests, not physical-wallet or mainnet evidence.

Initial verification failures were an invalid below-dust underpayment fixture, a sandbox-blocked local database connection/secret-scan child process, and a local bundle-origin mismatch (3000 versus the QA server at 3001). The fixture uses a valid 546-satoshi underpayment; restricted checks were rerun with the required permissions; the optimized QA artifact is built with its actual localhost origin. No production security boundary was relaxed.
