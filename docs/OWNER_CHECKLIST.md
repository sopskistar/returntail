# BCH BLAZE final release checklist

Production: https://returntail.vercel.app. This checklist reflects the reported November 21 physical-wallet journey and the verification gaps found while preparing the final evidence. The 100,000-satoshi index-zero request was the earlier incorrect order; it is unrelated to the later reported 10,000-satoshi purchase and must remain preserved in history.

## Reconcile production evidence

1. Sign in through the existing merchant account in your normal browser. Open the confirmed 10,000-satoshi order and copy the persisted payment txid, 4,000-satoshi refund txid and refund database UUID. Do not share the private customer link, access token, browser cookie, wallet pairing QR, password, seed phrase or private key.
2. Compare both txids using at least two BCH mainnet sources. Record each actual matching output index and amount, block hash/height, confirmations, and the verification time. The purchase txid supplied so far was not found by three public lookups; check it against the production order rather than relying on the copied value.
3. In the merchant order, confirm the 4,000-satoshi refund is Confirmed, the rejected 7,000-satoshi request is Rejected, and the final accounting is 4,000 settled, 0 reserved, 6,000 remaining. This is application evidence, distinct from chain inclusion.
4. Open `https://returntail.vercel.app/resolution/<refund-database-UUID>` while logged out. Confirm the receipt omits addresses, reasons, customer access data, sessions and raw transaction bytes. The UUID is the `refunds.id`, not the refund txid.
5. Set Vercel `PUBLIC_PROOF_REFUND_ID` to that exact refund UUID only after steps 1–4 pass. Then verify `/evidence` publicly displays the receipt. Set `WIDGET_FACTORY_URL` to the publicly viewable URL of the already-created Google Slides deck. These values are currently not confirmed; do not substitute the payment txid or create another deck.

## Final submission gates

- [ ] Check the public repository and current Vercel deployment commit.
- [ ] Complete the evidence ledger from the persisted production order and independent providers.
- [ ] Publish and inspect the existing Widget Factory Google Slides presentation. Use the official [BCH BLAZE Widget Factory template](https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing) as the content/layout requirement; do not replace the existing deck.
- [ ] Record genuine hosted-app/chain evidence for the video. Any damaged-parcel story must be labeled hypothetical; this purchase/refund is a self-test. Do not stage wallet signing.
- [ ] Check the DoraHacks project page and current submission fields. Official BCH BLAZE schedule lists submissions/judging beginning November 22, 2026 at 14:00 UTC. DoraHacks rules and any video-duration limit could not be confirmed through automated access; verify directly before uploading.
- [ ] Confirm the account was registered before registration closed November 13, then verify preparation-stream roll-call and Telegram project confirmation in your own records. Neither attendance nor Telegram participation is evidenced in this repository.
- [ ] Review homepage project, deck, and EMBER2026 CashTokens links. Confirm the donation address is still configured and token-compatible; do not send a donation as part of verification.
- [ ] Manually submit the final project on DoraHacks and retain its submission confirmation. No submission or announcement is automated here.

## Accurate product limits

The system is non-custodial: the merchant wallet signs refunds. It cannot stop additional BCH transfers made outside ReturnTail. A supplied wallet xpub and pairing do not prove ownership. Refunds are new transactions. Approval reserves funds in the application ledger but does not itself transfer BCH. Unknown broadcasts retain the same signed attempt until reconciled. Current scope includes one store per account, standard P2PKH BCH, bounded receive-address discovery, no email verification/password recovery, and daily scheduled reconciliation plus manual refresh.
