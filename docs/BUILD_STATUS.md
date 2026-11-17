# Build status

Baseline: b6f2fe5. Status updated with actual test evidence throughout implementation. PASS requires implementation and observed checks; owner-only gates remain explicit.

| Gate | Current status | Evidence / remaining |
|---|---|---|
| M0 research / architecture | Implemented | Official references, dependency registry inspection; DoraHacks blocked automated access |
| M1 wallet / network | Partial verification | Official SDK integration foundation; real read-only Chipnet TLS connection and checkpoint passed November 17, live height 335328. Wallet handshake/signing pending owner |
| M2 account / orders / database | In progress | Initial PostgreSQL migration applied atomically to isolated local PostgreSQL 17 |
| M3 refunds / settlement | In progress | Server state machine and durable signed-attempt pipeline implemented; tests pending |
| M4 adversarial tests | Pending | Will record actual totals |
| M5 design / responsive QA | In progress | Original direction selected; screenshots pending |
| M6 production readiness | Pending | Neon credentials and deployment authorization unavailable |
| M7 proof / judging | Pending | Mainnet proof requires funded wallets and owner signing; no transactions fabricated |

Commands executed: `npm install --no-fund` succeeded (447 packages initially); `npm run db:migrate` succeeded against isolated local PostgreSQL; `npm run proof:network` succeeded read-only on Chipnet. Initial typecheck identified implementation errors, being fixed; not yet a pass. Initial dependency audit reported four moderate advisories; investigation pending. No live deployment or production transfers.

Files: see git milestone commits. Commit IDs will be recorded after each checked milestone. Required owner actions will be consolidated in docs/OWNER_CHECKLIST.md.
