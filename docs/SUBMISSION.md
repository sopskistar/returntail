# BCH BLAZE 2026 — DoraHacks submission draft

This text is ready for manual review and submission. Check the current form and eligibility in the [DoraHacks event](https://dorahacks.io/hackathon/bchblaze2026). The [official BCH BLAZE site](https://bchblaze.cash/) lists the hackathon dates and the November 22, 2026, 14:00 UTC submission start/deadline. Do not claim personal registration, attendance, or Telegram confirmation without checking those records directly.

## Project title

**ReturnTail — Merchant-controlled BCH refund resolution**

## Short description

ReturnTail links a Bitcoin Cash purchase to a customer refund request, an atomic merchant decision, wallet-authorized settlement, and a privacy-limited record of what happened.

## Project description

BCH checkout settles directly, but when an order needs a refund the customer and merchant still have to reconnect the original payment, the request, the decision, a receiving address, and a new wallet transaction. ReturnTail keeps that work in one purchase-to-resolution record. It checks the exact BCH payment output, lets the customer holding the private purchase capability ask for a refund, reserves merchant-approved amounts against the purchase balance, and presents a reviewed new transaction for explicit merchant-wallet authorization.

ReturnTail does not custody BCH or hold spending keys. The application treats approval, wallet signature, broadcast, network observation, and confirmation as separate events. Signed bytes and their transaction identity are saved before broadcast. If delivery is uncertain, reservations remain and recovery reconciles the same bytes instead of creating a replacement transaction.

The production self-test used physical Selene and Paytaca wallets. Selene paid 10,000 sats; Paytaca authorized a 4,000-sat refund with a 454-sat fee. Two independent BCH sources confirm the payment output, refund output, spend relationship, and block records. The public receipt is [6c5fb204-f24e-4fa1-b944-d4ff710ecb02](https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02). The participant reports that an additional 7,000-sat approval was refused by the app’s refund limit and the request was rejected; that private merchant decision trail has not yet been independently retrieved. This is a self-test, not a third-party customer result. Full distinctions and links are in the [mainnet proof ledger](MAINNET_PROOF.md).

## What the implementation adds

Unique receiving destinations connect a payment output to an order. Exact satoshi accounting and atomic PostgreSQL reservations prevent concurrent app approvals from exceeding the recorded purchase amount. WizardConnect lets the merchant’s wallet review and sign; transaction parsing and the BCH script VM validate the returned intent before a durable broadcast. Provider-backed transaction and merkle observations provide a checkable settlement trail. A public receipt shows chain evidence while withholding customer capability, contact data, reason, destination, and raw transaction bytes.

## Limits and risks

ReturnTail cannot prevent extra transfers made outside the application. A connected wallet or xpub is not proof of control of every address. Blockchain providers are operational dependencies; the app is not a full proof-of-work node. The current product supports one store per account, standard P2PKH BCH, and bounded receive-address discovery. There is no email verification or password recovery. The mainnet journey is a self-test; no customer adoption, revenue, or performance metric is claimed.

## Links

- Live application: https://returntail.vercel.app
- Judge walkthrough: https://returntail.vercel.app/guide
- Break It Lab: https://returntail.vercel.app/lab
- Public resolution receipt: https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02
- Public source: https://github.com/sopskistar/returntail
- Evidence index: https://returntail.vercel.app/evidence (feature the receipt by setting Production `PUBLIC_PROOF_REFUND_ID=6c5fb204-f24e-4fa1-b944-d4ff710ecb02` and redeploying)
- Existing Widget Factory deck: add the existing public Slides URL; do not create a replacement
- Final demo video: add the published recording URL when finished; the current engineering preview is not a final demo
- EMBER2026 donation: use the token-compatible CashAddress displayed on the live homepage. Do not send a donation as a test.

## Pre-existing work, dependencies, and AI assistance

The earliest commit in this repository is dated November 17, within the November 14–22 build period. Git history cannot prove that all project work began on that date. Disclose any genuine pre-event concept/prototype accurately and identify which work changed during the hackathon. Third-party packages and font licenses are listed in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). AI tools assisted with implementation, review, and documentation. Confirm whether the DoraHacks form asks for additional AI disclosures.

## Participant checklist — verify personally

- [ ] Confirm the existing DoraHacks participant/project entry and registration status.
- [ ] Complete the Widget Factory-based presentation using the already-created deck; publish it and set `WIDGET_FACTORY_URL` to its public URL.
- [ ] Record and inspect the final demo using [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md). Do not fabricate a wallet signature or private order screen.
- [ ] If using the `/evidence` index, set `PUBLIC_PROOF_REFUND_ID` to the verified refund database UUID above, redeploy, and check it logged out.
- [ ] Confirm preparation-stream attendance/roll call and the project’s BCH BLAZE Telegram verification in the participant’s own account/chat. These are not evidenced here.
- [ ] Recheck the current event instructions for required banner content, video/media format, public links, and other submission fields.
- [ ] Submit manually before the deadline shown on the official event form and save the confirmation.
