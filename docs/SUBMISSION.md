# Submission preparation

**Not ready to claim complete Mainnet Track compliance yet.** Application source and local tests can be reviewed; funded owner execution, public deployment and eligibility remain gates.

Title: ReturnTail — merchant-controlled BCH refund resolution.

Short description: ReturnTail connects an independently verified BCH purchase to a customer refund request, an atomic merchant approval, a real wallet-signed refund and a public-safe resolution receipt.

Problem: irreversible checkout transactions are excellent for settlement but leave merchants handling refunds with copied addresses and disconnected support messages.

Solution: one purchase-to-refund record, with exact satoshi accounting and explicit boundaries between approval, signing, broadcast, network observation and confirmation.

Why BCH: low-fee direct payments allow small, useful merchant refunds without custody or a platform payout balance. Refunds are new BCH transactions, not reversals.

Implementation: Next.js, TypeScript, React, PostgreSQL, official WizardConnect, Libauth, TLS Fulcrum. No backend spending keys. Open-source libraries disclosed in THIRD_PARTY_NOTICES.md; original app starts from the initial repository README/license.

Owner completion checklist:

- Confirm registration/workshop/Telegram eligibility and official deadline directly.
- Check current official video-duration requirements (DoraHacks automated access blocked).
- Configure Neon and authorize Vercel; verify public HTTPS app and all endpoints.
- Complete actual Paytaca signing, payment, partial refund, receipt and duplicate-rejection journey.
- Publish Widget Factory presentation and supply homepage link + token-compatible donation address.
- Populate mainnet proof ledger from real transactions and include public-safe receipt.
- Record and verify final mainnet demo footage; the engineering preview is not a substitute.
- Revalidate source is public and final commit is pushed.
- Submit manually. Do not announce, submit, or transfer funds automatically.
