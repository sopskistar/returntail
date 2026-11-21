# ReturnTail

**A payment problem should not become a trust problem.**

Non-custodial Bitcoin Cash purchase-to-refund resolution: unique-address payment requests, independent output verification, customer requests, atomic merchant approvals, genuine WizardConnect signing, durable broadcasts, and public-safe resolution receipts.

The live application is [returntail.vercel.app](https://returntail.vercel.app). The creator reports completing a physical-wallet mainnet purchase and partial refund in production. The supplied purchase txid is recorded in [the evidence ledger](docs/MAINNET_PROOF.md), but current independent lookups did not find it; the refund txid and refund record ID were not accessible without the authenticated merchant session. Treat both transaction and application evidence as pending independent verification until that ledger is completed. Infrastructure health alone is not transaction proof.

## Run locally

Requires Node 22.13+, npm and PostgreSQL 17 (Neon-compatible). No private spend keys or wallet seed phrases are used by the server.

```sh
npm ci
cp .env.example .env.local
# Securely configure DATABASE_URL and a random AUTH_SECRET of >=32 characters.
npm run db:migrate
npm run typecheck
npm run dev
```

Default network is Chipnet. Set `BCH_NETWORK=mainnet` deliberately for production; set `NEXT_PUBLIC_APP_URL` to the exact browser origin at build time and runtime. The app refuses mismatched address/key networks and checks chain-specific fork checkpoints.

For a local test database:

```sh
docker run --name returntail-test-postgres -p 127.0.0.1:55432:5432 \
  -e POSTGRES_USER=returntail -e POSTGRES_PASSWORD=returntail-local-test-only \
  -e POSTGRES_DB=returntail -d postgres:17-alpine
```

The example password above is **local test data only**. Use the corresponding localhost connection in `.env.local`; never use it for hosted infrastructure. Migration runs atomically and verifies checksums before applying changes.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm run start
npm run test:e2e
npm run scan:secrets
npm audit
```

Unit tests use isolated BCH fixtures with actual parsing/signature verification. Database tests use genuine PostgreSQL in the dedicated `returntail_security_test` schema; override only with an intentionally isolated `RETURNTAIL_TEST_DATABASE_URL`. Browser tests are restricted to localhost and explicitly label QA fixture records. They create accounts/orders, verify access controls, safe text rendering, refund reservations and WizardConnect QR creation. They **never authorize or broadcast real transfers**. The fixture suite is not a claim of physical-wallet compatibility.

Playwright uses an existing compatible Chromium cache when available; otherwise install the browser matching the pinned Playwright package. No browser is bundled into the app runtime. Browser QA defaults to localhost:3001; set `RETURNTAIL_QA_URL` for another local port and match `NEXT_PUBLIC_APP_URL`.

Read-only infrastructure probes:

```sh
npm run proof:network -- chipnet
npm run proof:network -- mainnet --probe
npm run smoke -- https://your-authorized-deployment.example
```

The optional mainnet probe validates an **unrelated public transaction**, merkle inclusion and witness agreement. It does not create an order, spend funds, or prove a ReturnTail refund. Public provider availability can change. Default mainnet witness is bch0.kister.net; no silent fallback to a single-provider confirmed result.

## Product boundaries

- One store per merchant account. Password login and server-side sessions are separate from wallet pairing.
- Customer receipt access is an unguessable capability supplied in a URL fragment, then sent in an Authorization header. Save/share it carefully.
- Exact BCH satoshi amounts; unique P2PKH receiving address per order; confirmed, token-free receive-path funding. Discovery checks five addresses at a time; change-only UTXOs are not selected in this release.
- A supplied receive xpub is unverified ownership. Observed valid spends prove control only of their specific source addresses.
- Approval reserves the refund amount; signing and broadcast remain separate. Completed settlement requires independently observed block inclusion.
- Timeouts retain signed bytes, txid and reservations. An explicit recovery action rechecks the network and can rebroadcast **identical bytes only**. Signed attempts are never replaced with fresh inputs.
- Concurrent approvals, idempotency, unique output allocation, input reservations and a settlement ledger enforce the app-level refund limit. Extra merchant transfers outside the app remain possible.
- Release limits: one store per account, standard P2PKH BCH only, no email verification or password recovery. Visitor analytics are disabled.

## Deployment and judging

The existing Vercel production project deploys from `main`. Its Next.js build configuration applies the checksum-verified Neon migration before building; preview builds skip automatic migrations. Cron requires CRON_SECRET; the free schedule is daily, while open receipt pages also reconcile pending transactions periodically. See [deployment operations](docs/DEPLOYMENT.md).

Start with the [final release checklist](docs/OWNER_CHECKLIST.md), [mainnet proof ledger](docs/MAINNET_PROOF.md), [security tests](docs/SECURITY_TESTS.md), [architecture](docs/ARCHITECTURE.md) and [submission draft](docs/SUBMISSION.md). Earlier build reports remain historical and are superseded where the proof ledger says so. The hosted evidence page currently has no published receipt. Set `PUBLIC_PROOF_REFUND_ID` only to the actual confirmed refund database UUID after reviewing the public-safe receipt.

Original branding lives in `public/brand`, `DESIGN.md` and `docs/BRAND_GUIDE.md`. [Third-party notices](THIRD_PARTY_NOTICES.md) include SDK and OFL font licenses. The separate `video/` package reuses the installed Hackathon Video Studio tools; its rendered engineering preview is clearly labeled, and the final mainnet demo script awaits genuine wallet footage.
