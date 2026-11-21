# ReturnTail

**Make it right. Make it verifiable.**

A non-custodial Bitcoin Cash (BCH) purchase-to-refund workflow. Customers can request a refund against a specific confirmed purchase; merchants review the remaining refundable balance, approve an amount, and authorize the new BCH transaction from their own wallet. Both sides can inspect a connected resolution record.

**[Open the live app](https://returntail.vercel.app) · [Play the Resolution walkthrough](https://returntail.vercel.app/#play) · [Inspect Break It Lab](https://returntail.vercel.app/lab) · [Read the evidence standard](https://returntail.vercel.app/evidence)**

Built for **BCH BLAZE 2026 · Mainnet Track**. [Source code](https://github.com/sopskistar/ReturnTail) · [Security tests](docs/SECURITY_TESTS.md) · [Mainnet proof ledger](docs/MAINNET_PROOF.md)

## The problem

A BCH payment can settle directly to a merchant, but the story does not end at checkout. When a customer needs a partial refund, purchase proof, refund destination, merchant approval, and the new transfer often live in disconnected messages and wallet histories. That makes mistakes and duplicate refunds harder to spot.

**ReturnTail joins the purchase, merchant decision, wallet-authorized refund, and settlement evidence without taking custody of funds.**

## Try ReturnTail in two minutes

You do **not** need to fund a wallet to inspect these existing features.

| Do | See |
| --- | --- |
| Open the [home page](https://returntail.vercel.app) and select **Play the Resolution**. | A guided explanation of the verified-purchase → refund-request → merchant-approval → receipt workflow. The walkthrough is explanatory, not a simulated mainnet payment. |
| Open [Break It Lab](https://returntail.vercel.app/lab), then run the three **read-only checks**. | The deployed health endpoint returns HTTP 200; unauthenticated merchant and purchase endpoints return the expected HTTP 401 responses. No wallet or funds are used. |
| Scroll down the lab to **Financial safeguards need deeper tests**. | Links to isolated PostgreSQL and BCH validation tests for refund limits, concurrent approvals, signed-transaction validation, and uncertain broadcast recovery. |
| Inspect the [evidence guide](https://returntail.vercel.app/evidence) and [mainnet proof ledger](docs/MAINNET_PROOF.md). | A clear separation between merchant application records, signed transactions, network observation, and block confirmation. |

**To execute a real purchase and refund**, use two compatible BCH wallets, separate browser profiles, and your own funds. Start with the [unfunded wallet preflight](https://returntail.vercel.app/wallet-check). Every actual payment and refund requires separate human wallet authorization; the server never holds a spending seed or private key.

## A production self-test: 10,000 satoshis in, 4,000 refunded

On November 21, 2026, the creator used physical **Selene (customer)** and **Paytaca (merchant)** wallets with ReturnTail on BCH mainnet. Production screenshots supplied by the creator show the following journey:

| Step | Recorded application result |
| --- | --- |
| Original purchase | Selene authorized **10,000 sats (0.00010000 BCH)** to the merchant's order-specific receiving address; ReturnTail later displayed **Confirmed**. |
| Customer requests | Two partial-refund requests were made: **4,000 sats** and **7,000 sats**. |
| Merchant approves | The **4,000-sat** request was approved, reserving that amount and leaving **6,000 sats** refundable in the application. |
| Excessive approval | Attempting to approve the additional **7,000 sats** was refused because it would exceed the available refund budget; that request was rejected. |
| Merchant refunds | Paytaca authorized a new **4,000-sat** BCH refund; ReturnTail subsequently displayed the refund as **Confirmed** and the public-safe resolution view as complete. |

This is a **self-test**, not an unrelated customer purchase. The source repository's [mainnet proof ledger](docs/MAINNET_PROOF.md) distinguishes what the production interface displayed from independent chain observations: the supplied purchase transaction ID did not resolve in three external lookups during the release review, and the refund transaction ID was not available to that review session. Those missing independent checks must not be described as completed verification. Use the authenticated order and public resolution receipt to reconcile both transaction IDs and their block inclusion.

## How it works

1. **Create a payment request.** A merchant signs in, pairs a BCH wallet through WizardConnect, and receives an order-specific BCH address. Address matching is checked before sharing the private customer link.
2. **Pay directly.** The customer reviews the exact recipient, satoshis, network fee, source inputs, and change, then signs in their own wallet. Funds go directly to the merchant.
3. **Verify the purchase.** ReturnTail reads transaction bytes, checks the recipient output and exact amount, and distinguishes observation from confirmed block inclusion.
4. **Request and decide.** The customer asks for a full or partial refund. PostgreSQL-backed, atomic reservations prevent concurrent in-app approvals from exceeding the remaining refundable amount. Approval does not move funds.
5. **Authorize the refund.** The merchant reviews the new transaction and separately signs with their wallet. ReturnTail validates the signed bytes against the approved intent before broadcast.
6. **Reconcile and share evidence.** The application tracks the saved transaction through observation and confirmation, without silently replacing uncertain signed attempts. A limited public receipt links the original payment to the refund without disclosing customer access capabilities or private reasons.

**BCH settles the payment. ReturnTail connects the resolution.**

## Why Bitcoin Cash, and what ReturnTail adds

| BCH and wallet infrastructure | ReturnTail's contribution |
| --- | --- |
| Bitcoin Cash mainnet transfers BCH directly between wallets. | Purchase-specific output checks, confirmed settlement states, and linked refund records. |
| WizardConnect connects supported physical wallets for explicit signing. | A reviewed signing intent, exact recipient/fee/change validation, and no server custody. |
| Public transaction data and block proofs can be checked independently. | An application-level decision trail and a privacy-limited receipt that distinguishes approval from settlement. |
| Low-fee BCH transfers make small refunds practical. | Atomic refund budgets, duplicate handling, and retained signed attempts for uncertain network outcomes. |

The implementation uses **Next.js, React, TypeScript, PostgreSQL/Neon, WizardConnect, and Libauth BCH transaction validation**. More detail: [architecture](docs/ARCHITECTURE.md), [security model and adversarial cases](docs/SECURITY_TESTS.md), [deployment](docs/DEPLOYMENT.md).

## Code verification and safeguards

The November 21 release reported **43 unit tests, 90 isolated PostgreSQL integration tests, and 18 local browser tests** passing, plus typecheck, lint, production build, secret scanning, and **23/23 read-only hosted smoke checks**. These are dated engineering results, not a substitute for live chain proof or a third-party audit.

Representative checks cover excessive and concurrent refund approval, wrong recipients and underpayments, cross-account access, receipt capabilities, request idempotency, signed-output tampering, BCH signature validation, and timeout recovery. The [Break It Lab](https://returntail.vercel.app/lab) runs three safe live API checks; financial mutation checks are executed in isolated automated tests, **not** against viewers' production balances.

[Tests and limits](docs/SECURITY_TESTS.md) · [Build results](docs/BUILD_STATUS.md) · [Release report](docs/RELEASE_REPORT.md)

## Run locally

Requires **Node.js 22.13+**, npm, and a dedicated PostgreSQL 17 database (local or Neon-compatible). Copy configuration to a private local file; never commit keys or test against the production financial database.

```bash
git clone https://github.com/sopskistar/ReturnTail.git
cd ReturnTail
npm ci
cp .env.example .env.local
# Set DATABASE_URL to an isolated PostgreSQL database and set a random AUTH_SECRET.
npm run db:migrate
npm run typecheck
npm run dev
```

The default BCH network is Chipnet. Set `BCH_NETWORK=mainnet` only after checking the correct infrastructure and intended use. The application never requires users to provide seed phrases or spending private keys.

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm run test:e2e
npm run scan:secrets
```

Database and browser tests have specific isolation requirements; follow [the full local setup](docs/DEPLOYMENT.md) and [test notes](docs/SECURITY_TESTS.md). Production smoke checks must stay read-only.

## Scope and honest limits

- **Non-custodial:** ReturnTail neither holds merchant BCH nor signs on a merchant's behalf. A connected public key alone does not prove ownership.
- **Refund limits are application-level:** the platform cannot stop additional transfers a merchant makes outside ReturnTail.
- **Live supports standard P2PKH BCH:** no CashToken settlement, universal wallet compatibility, password recovery, or email verification is claimed.
- **Blockchain evidence and application assertions differ:** chain inclusion can establish a transaction and output; the merchant's reason for approving a refund lives in the application record.
- **Network uncertainty is not success:** signed, broadcast, observed, and confirmed states remain distinct. External chain providers may be unavailable or disagree.
- **Private links are capabilities:** never publish customer checkout URLs containing access fragments. Public receipts intentionally omit private customer data.

The project was developed during the November 2026 BLAZE build period. AI-assisted development and third-party packages are disclosed in [third-party notices](THIRD_PARTY_NOTICES.md); the code and design remain open for inspection. The final judge video and a fully reconciled independent proof ledger are separate submission items and should only be linked once verified.

**[Live application](https://returntail.vercel.app) · [Read-only lab](https://returntail.vercel.app/lab) · [Evidence ledger](docs/MAINNET_PROOF.md) · [Source](https://github.com/sopskistar/ReturnTail)**
