<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ReturnTail invariants

- Read PRODUCT.md, DESIGN.md, docs/ARCHITECTURE.md and docs/BUILD_STATUS.md before changes.
- Preserve the purchase-to-refund scope and original branding; use the installed Creative Studio guidance for UI work.
- Never request/store recovery phrases or spending keys. The server cannot sign funds out of a wallet.
- Never substitute a frontend status change or fixture for wallet authorization and independent BCH evidence.
- Settled plus reserved refunds cannot exceed the original eligible amount. Preserve row locks, idempotency, unique output/input identities and the settlement ledger.
- Save signed bytes and their txid before broadcast. Unknown outcomes keep reservations; recovery can rebroadcast identical bytes only after reconciliation. Never create a replacement with new inputs automatically.
- Chipnet and mainnet records, keys and evidence must stay distinct. Wallet connection is not authentication or ownership proof.
- Automated blockchain data must be isolated fixtures; never automate production-money transfers.
- Public receipts must omit private capabilities, personal reasons and account information.
- Run typecheck, lint, unit tests, PostgreSQL integration tests, production build, localhost browser tests, dependency audit and secret scan before release.
- Real wallets, credentials, deployment, mainnet signatures and competition submission require the owner's actions. Do not claim them verified from local tests.
