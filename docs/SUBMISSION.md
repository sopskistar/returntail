# BCH BLAZE 2026 — DoraHacks draft

**Draft status: do not paste transaction-evidence claims until `MAINNET_PROOF.md` is completed and `/evidence` shows the actual public receipt.** Deadline per the official BCH BLAZE schedule: November 22, 2026, 14:00 UTC. Registration closed November 13. Submission is a manual action.

## Submission text

**Project title**

ReturnTail — Merchant-controlled BCH refund resolution

**One-line summary**

ReturnTail connects a BCH purchase to a customer refund request, an atomic merchant approval, a physical-wallet-signed refund, and independently checkable settlement evidence.

**Project description**

Bitcoin Cash checkout settles directly to a merchant wallet, but post-purchase problems still leave customers and merchants coordinating addresses, decisions, and partial refunds across disconnected messages. ReturnTail links each unique-address purchase to customer refund requests, a concurrency-safe refund budget, explicit merchant approval, a new merchant-authorized BCH transaction, and a public-safe resolution record.

The deployed application uses WizardConnect so the merchant wallet authorizes the refund; ReturnTail does not hold spending keys or custody a payout balance. Approval and settlement are separate. Signed bytes and their transaction id persist before broadcast, uncertain states keep their reservation, and recovery checks the same transaction rather than silently constructing a replacement.

The creator reports a real physical-wallet self-test: a 10,000-satoshi Selene payment to the Paytaca merchant, a 4,000-satoshi Paytaca-signed refund, and a rejected 7,000-satoshi over-limit approval. The supplied payment txid did not resolve in three independent public lookups during release verification, and the persisted refund txid/record ID was not accessible without the authenticated merchant session. Until the public evidence receipt is reconciled, present these as reported test outcomes, not independently established chain proof.

**What is new/useful**

The connected purchase-to-resolution workflow, atomic concurrent refund limits, durable uncertain-settlement handling, exact output verification, and a privacy-limited public receipt make small direct BCH refunds auditable without making the merchant wallet custodial.

**Limits**

The self-test is not an unrelated customer case. The app cannot prevent a merchant from sending additional BCH outside ReturnTail. Wallet connection/public keys alone are not proof of ownership. The current release supports standard P2PKH BCH and bounded receiving-address discovery; it has no email verification or password recovery. Merkle/provider checks depend on public infrastructure and do not replace a fully validating node.

## Links to enter after checking

- Live demo: https://returntail.vercel.app
- Public source: https://github.com/sopskistar/returntail
- Evidence ledger: https://github.com/sopskistar/returntail/blob/main/docs/MAINNET_PROOF.md
- Public proof page: https://returntail.vercel.app/evidence (currently shows proof not published; update after configuring the correct refund UUID)
- Widget Factory deck: **existing Google Slides URL not supplied to this workspace**
- Demo video: **final video not produced; the existing 45-second artifact is an isolated engineering preview, not a final demo**
- CashTokens donation: use the address rendered by the current production homepage and ensure it is a token-compatible address; do not copy an unverified value from an old environment report.

## Organizer and participant checks

The official site lists a live, usable hosted demo and schedule; the DoraHacks detail/resources pages were not accessible in automated inspection. A published competition listing describes the Mainnet Track requirements as registration/submission, a Widget Factory-template presentation, original or significantly improved hackathon work, a feature sending BCH mainnet transactions, a usable live demo, WizardConnect integration, one preparation-stream attendance with roll-call, and confirming the project in BCH BLAZE Telegram. Confirm these directly on the DoraHacks page and with your own account.

The repository's first commit is dated November 17, 2026, inside the November 14–22 hacking window. This history is useful source-work disclosure, but does not prove what existed before that commit. Third-party packages and licenses are listed in `THIRD_PARTY_NOTICES.md`.

## Final manual steps

1. Retrieve the persisted payment and refund txids and refund record UUID from the logged-in merchant order. Independently verify both transactions and finish the proof ledger.
2. Open the public receipt while logged out. Configure Vercel `PUBLIC_PROOF_REFUND_ID` using the refund database UUID only. Set `WIDGET_FACTORY_URL` using the existing public Google Slides deck URL.
3. Verify the homepage project/deck/donation links, live public receipt, and production commit. Record a final video from genuine evidence; do not fabricate physical-wallet authorization footage.
4. Confirm registration, roll-call, Telegram project confirmation, template and any video/media rules. Save evidence of these personal eligibility requirements.
5. Submit the project manually before the displayed DoraHacks deadline and save its confirmation. Do not claim event attendance or platform confirmation without your own records.
