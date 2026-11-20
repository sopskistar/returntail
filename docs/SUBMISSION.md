# Submission preparation

**Not ready to claim complete Mainnet Track compliance yet.** Public source and the live Vercel application can be reviewed. Neon, HTTPS authentication and runtime BCH connectivity are verified; funded physical-wallet execution and participant eligibility remain gates.

Title: ReturnTail — merchant-controlled BCH refund resolution.

Short description: ReturnTail connects an independently verified BCH purchase to a customer refund request, an atomic merchant approval, a real wallet-signed refund and a public-safe resolution receipt.

Problem: irreversible checkout transactions are excellent for settlement but leave merchants handling refunds with copied addresses and disconnected support messages.

Solution: one purchase-to-refund record, with exact satoshi accounting and explicit boundaries between approval, signing, broadcast, network observation and confirmation.

Why BCH: low-fee direct payments allow small, useful merchant refunds without custody or a platform payout balance. Refunds are new BCH transactions, not reversals.

Implementation: Next.js, TypeScript, React, PostgreSQL, official WizardConnect, Libauth, TLS Fulcrum. No backend spending keys. Open-source libraries disclosed in THIRD_PARTY_NOTICES.md; original app starts from the initial repository README/license.

Submission checklist:

- Confirm registration/workshop/Telegram eligibility and official deadline directly.
- Check current official video-duration requirements (DoraHacks automated access blocked).
- Recheck the HTTPS app after the final deployment; inspect the actual production commit.
- Complete actual Paytaca signing, payment, partial refund, receipt and duplicate-rejection journey.
- Publish the Google Slides presentation and set `WIDGET_FACTORY_URL`. The token-compatible donation address is already configured.
- Populate mainnet proof ledger from real transactions and include public-safe receipt.
- Record and verify final mainnet demo footage; the engineering preview is not a substitute.
- Revalidate source is public and final commit is pushed.
- Submit manually. Do not announce, submit, or transfer funds automatically.
