# Vercel + Neon release preparation

No hosted deployment is claimed. User authorization, a Neon connection string and production environment configuration remain required.

1. Provision PostgreSQL on Neon; use the intended database/pooler URL with required TLS settings. Keep the URL only in secure environment configuration.
2. Set `AUTH_SECRET` (random >=32 characters), canonical `NEXT_PUBLIC_APP_URL`, `BCH_NETWORK`, `DATABASE_URL`, and `CRON_SECRET`. For a mainnet release set mainnet deliberately at build and runtime. Default primary bch.imaginary.cash / witness bch0.kister.net were checked; optional host/port overrides must be independent and serve the configured chain.
3. Apply `npm run db:migrate` from a controlled environment. The runner acquires an advisory lock, checks the migration checksum, and wraps DDL/recording in a transaction. It refuses a modified applied migration. Create a new migration for future schema changes rather than editing applied SQL.
4. Import the existing public GitHub repository into Vercel, framework Next.js, Node22, install `npm ci`, build `npm run build`. The separate video package is excluded from app TypeScript/build dependencies.
5. Authorize deployment, then run `npm run smoke -- https://actual-public-url`. It checks public pages/assets, DB readiness and unauthenticated workspace rejection without creating records or sending money.
6. Verify merchant login/session cookies over HTTPS, customer private capability flow, actual wallet relay and network choice, genuine mainnet payment/refund and receipt in the owner checklist. Localhost production-mode checks are not hosted verification.
7. Confirm authenticated cron `/api/jobs/reconcile` accepts only `Authorization: Bearer CRON_SECRET`. Free Vercel cron is scheduled daily. The UI also reconciles pending signed attempts periodically; no real-time SLA is promised. Providers can fail; unknown attempts remain reserved.
8. Supply real Widget Factory and token-compatible donation settings. Optionally set `PUBLIC_PROOF_REFUND_ID` to the owner's actual confirmed mainnet refund; `/evidence` only surfaces it after persisted merkle/witness confirmation evidence meets the gate. Do not put a test fixture into production evidence.

Operational responsibilities: database backup/retention, secret rotation plan, public-provider monitoring, scheduler, private support channel and account-recovery policy. Logs intentionally contain normalized event codes rather than raw transactions, public keys, customer reasons or credentials. Account email is not yet independently verified; no password-recovery mailer is implemented. These limits are disclosed before general availability.

No automatic migration runs on each serverless request. No debug seed endpoint is deployed. Fixtures are test-source-only and browser fixture tests refuse non-local URLs.
