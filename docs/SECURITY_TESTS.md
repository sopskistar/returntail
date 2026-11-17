# Security verification

Automated fixtures are isolated. They do not establish actual wallet compatibility, mainnet execution or hosted security. The BCH tests use real transaction serialization, signatures and Libauth VM validation. Integration tests run against PostgreSQL 17, not an in-memory database.

Current executed totals: **28 core/unit + 36 PostgreSQL integration + 11 browser = 75 tests**. Final release report records the last check results and commit. Production-mode browser fixture tests are localhost-only; no automated funded transfer is permitted.

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

Actual Paytaca/Selene handshake, network selection, reconnection, signature refusal, successful signing and complete mainnet transfer require owner devices and consent. Hosted Neon/Vercel, production cookie behavior at HTTPS, scheduler, confirmations, reorg/provider outage operations and full screen-reader coverage are not verified by local fixtures.

First browser attempts surfaced a WASM CSP error (fixed and retested), development cold-compile timing, and reused fixture xpub collisions (tests now derive per-run keys; store configuration returns an explicit registered-key error). An obsolete witness timed out; a maintained Electron Cash registry witness was tested instead. Failures are retained here rather than described as passes.
