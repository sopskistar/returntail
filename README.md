# ReturnTail

**Non-custodial Bitcoin Cash refund resolution — from a verified purchase to a checkable receipt.**

*Make it right. Make it verifiable.*

A BCH payment can settle in minutes. Resolving a problem afterward is harder: a merchant must find the original payment, evaluate the refund, avoid overpaying, authorize a new transaction, and give the customer evidence. **ReturnTail connects those steps without taking custody of either wallet.**

**[Watch the demo video](https://youtu.be/gKpCjxFewzc) · [Live application](https://returntail.vercel.app) · [Try the judge walkthrough](https://returntail.vercel.app/guide) · [Inspect the confirmed receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02) · [Break It Lab](https://returntail.vercel.app/lab) · [Widget Factory presentation](https://docs.google.com/presentation/d/1dSwEQk5Qs9_TqOnJxOJmmFjK1PO3tGQLKaZ7u9cp12g/edit?usp=sharing)**

## Watch the ReturnTail demo

[![Watch the ReturnTail hackathon demo on YouTube](https://img.youtube.com/vi/gKpCjxFewzc/hqdefault.jpg)](https://youtu.be/gKpCjxFewzc)

**[Watch on YouTube](https://youtu.be/gKpCjxFewzc)** — ReturnTail's submitted product demonstration.

![ReturnTail's deployed homepage](docs/images/returntail-production-home.png)

## One purchase. One connected resolution.

1. **Verify the payment.** A merchant creates a request with its own BCH receiving address. ReturnTail checks the matching transaction output and its confirmation.
2. **Request a refund.** The customer uses their private purchase link to request a full or partial refund to a specified BCH address.
3. **Approve within the balance.** The merchant accepts or rejects the request. Atomic database reservations prevent approved and settled refunds from exceeding the recorded purchase value.
4. **Authorize in the wallet.** The merchant reviews and signs a **new** BCH transaction using WizardConnect. ReturnTail never holds the merchant's spending key.
5. **Confirm and share proof.** ReturnTail checks transaction evidence, reconciles settlement status, and produces a public-safe receipt linking the original payment and refund.

**A refund is a new BCH payment, not a reversal of the original transaction.** Merchant approval, wallet signing and blockchain confirmation are recorded as separate states.

## A completed BCH mainnet self-test

On **November 21, 2026**, I tested ReturnTail using separate customer and merchant wallets. This was a real-money *self-test*, not a third-party customer order.

| Step | Result | Evidence |
| --- | --- | --- |
| Original payment | **10,000 satoshis** paid to the merchant request; confirmed in block **978327** | [Transaction on Selene Explorer](https://explorer.selene.cash/tx/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65?network=mainnet) · [Blockchair](https://blockchair.com/bitcoin-cash/transaction/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65) |
| Refund decision | **4,000 satoshis** approved and reserved; **6,000** remained available | [Application and test-evidence explanation](https://returntail.vercel.app/lab) |
| Excessive request | An additional **7,000-satoshi** approval was blocked; the request was then rejected | [Financial safeguard tests](docs/SECURITY_TESTS.md) |
| Refund settlement | **4,000 satoshis** sent in a new BCH transaction; **454-satoshi** network fee; confirmed in block **978337** | [Transaction on Selene Explorer](https://explorer.selene.cash/tx/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b?network=mainnet) · [Blockchair](https://blockchair.com/bitcoin-cash/transaction/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b) |
| Public receipt | Both confirmed transactions linked to the same resolution record | **[Open the verified ReturnTail receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02)** |

The refund transaction spends the **10,000-satoshi output** from the original purchase. Selene Explorer and Blockchair independently reported matching transaction outputs and block records. The **4,000/7,000 approval decisions are application evidence**, not facts visible on the blockchain; their detailed private merchant audit was not independently accessed during the published reconciliation. Selene and Paytaca wallet attribution comes from the physical-wallet self-test, not the explorers.

[Full proof ledger, source comparison and verification limitations](docs/MAINNET_PROOF.md)

## Explore ReturnTail in two minutes — no funds needed

| Do | See |
| --- | --- |
| Open **[Play the Resolution](https://returntail.vercel.app/guide)** and run the walkthrough. | How the purchase, request, merchant decision and receipt connect. It does not create a payment. |
| Open **[Break It Lab](https://returntail.vercel.app/lab)** and run the three read-only checks. | Public service readiness and expected access-denial responses for private merchant and purchase APIs. |
| Review the lab's **DO → SEE → PROOF** tests. | Source-linked, isolated test evidence for cumulative refund limits, duplicate processing and merchant authorization. |
| Open the **[public mainnet receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02)** and follow its explorer links. | The actual payment, new refund, amounts and confirmation evidence without signing in or spending BCH. |

The lab's live probes are safe, credential-free reads. Its financial safeguards are backed by automated tests; they are not presented as live attacks against production funds.

## Why Bitcoin Cash — and what ReturnTail adds

| Foundation | ReturnTail's role |
| --- | --- |
| **Bitcoin Cash** | Direct wallet-to-wallet purchases and refunds with publicly inspectable transactions |
| **WizardConnect** | Wallet pairing and explicit signing without transferring private keys to the web application |
| **Selene / Paytaca** | Customer / merchant wallets used in the recorded mainnet self-test |
| **PostgreSQL + Neon** | Atomic refund reservations, authorization, idempotency, audit and reconciliation state |
| **BCH network providers** | Transaction output, block and merkle-inclusion checks, with a second provider as a witness |

Payment processors can display a transaction hash; **ReturnTail focuses on the workflow after checkout**: linking a verified purchase to a specific refund request, stopping cumulative over-refunding, keeping approval separate from signing, and producing a checkable resolution record.

### Safeguards built into the workflow

- **Exact accounting:** amounts use integer satoshis; refund approvals reserve value atomically against the original purchase.
- **Merchant control:** signing happens in the merchant wallet. Transaction inputs, recipient, amount and change are checked against the reviewed intent.
- **Replay and uncertain-broadcast handling:** transaction identity and signed bytes are saved before broadcast; uncertain attempts remain reserved, and recovery does not invent a replacement transfer.
- **Privacy and access control:** merchant operations require authorization; private purchase links are capability-protected; public receipts omit customer reasons, contact details, session credentials and raw signed bytes.

[Architecture](docs/ARCHITECTURE.md) · [Security tests and threat boundaries](docs/SECURITY_TESTS.md) · [Payment-request cancellation safety](docs/PAYMENT_REQUEST_CANCELLATION.md)

## Run locally

Requires **Node.js 22.13+**, npm and a separate PostgreSQL database (PostgreSQL 17 is used in testing). The default BCH network is **Chipnet**.

```sh
git clone https://github.com/sopskistar/ReturnTail.git
cd ReturnTail
npm ci
cp .env.example .env.local
```

Configure an **isolated development** `DATABASE_URL` and a randomly generated `AUTH_SECRET` of at least 32 characters in `.env.local`. Never put a seed phrase or wallet spending key in the app, and **never run fixture/integration tests against production Neon**.

```sh
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

For verification, point `RETURNTAIL_TEST_DATABASE_URL` to an isolated test database:

```sh
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm run test:e2e
npm run scan:secrets
npm audit --audit-level=high
```

The **November 21 release checks** reported **43 unit tests**, **90 isolated PostgreSQL tests**, a passing build, lint and typecheck, and **23/23 production smoke checks**. The latest browser run passed **19/20**; the remaining cancellation fixture was blocked by an external Chipnet provider DNS failure, not counted as a pass. These are dated results, not a claim that every production or wallet condition has been exhaustively tested.

[Release report](docs/RELEASE_REPORT.md) · [Deployment guide](docs/DEPLOYMENT.md) · [Detailed test record](docs/SECURITY_TESTS.md)

## Scope and attribution

ReturnTail currently supports one store per account, standard P2PKH BCH payments, bounded receiving-address discovery and provider-assisted verification. It does **not** run a full Bitcoin Cash proof-of-work node, provide email verification or password recovery, or prevent transfers made outside the application. A connected public key alone does not prove control of every derived address.

The mainnet result above is a **self-test**. It is not a claim of external customer adoption or an independent third-party security audit.

Built for **BCH BLAZE 2026**. The repository's earliest public commit is dated November 17, 2026; see [submission provenance and checklist](docs/SUBMISSION.md) for honest disclosure of any earlier work. AI-assisted development and editing were used. The code is [MIT licensed](LICENSE); third-party packages and asset licenses are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

**[Live app](https://returntail.vercel.app) · [Mainnet proof](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02) · [Presentation](https://docs.google.com/presentation/d/1dSwEQk5Qs9_TqOnJxOJmmFjK1PO3tGQLKaZ7u9cp12g/edit?usp=sharing)**

**[Final demo video on YouTube](https://youtu.be/gKpCjxFewzc)**

---

## Engineering portfolio: payments, PostgreSQL and reliability

**Architecture:** Vercel-deployed Next.js application and Neon/PostgreSQL persistence. Non-custodial BCH wallet signing via WizardConnect, independent chain-provider checks, atomic refund reservations, idempotent processing and a public verification receipt.

**Engineering tools:** TypeScript, Next.js, PostgreSQL/Neon, Vercel, BCH network APIs, WizardConnect, Zod, Vitest, Playwright, deployment smoke checks and secret scanning.

**Evidence:** [Mainnet self-test and limits](docs/MAINNET_PROOF.md) · [Security tests](docs/SECURITY_TESTS.md) · [Public proof receipt](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02).

**Scope:** describes a verified **self-test**, not commercial processing volume or independent customer adoption. No Terraform, Kubernetes or full backup-and-restore lifecycle is claimed.
