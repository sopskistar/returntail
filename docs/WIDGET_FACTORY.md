# Widget Factory deck — content for the existing Google Slides presentation

The user's existing deck is the presentation to finish. Do not create or substitute another deck. The public URL has not been provided to this workspace, so no slide content or `WIDGET_FACTORY_URL` can be edited/verified here. Use the organizer's [Widget Factory template](https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing) and preserve the existing design. A damaged-parcel story is hypothetical framing, not this self-test.

## Recommended compact story

1. **After checkout is where trust gets tested.** A hypothetical damaged parcel makes the problem concrete: how can a merchant make a small refund without losing track of the customer, decision, destination, or payment?
2. **One connected workflow.** Unique-address BCH purchase → transaction verification → customer request → merchant decision → merchant wallet authorization → new BCH refund → privacy-limited public proof.
3. **The real reported self-test.** 10,000 sats paid by Selene; 4,000 sats refunded with Paytaca after a displayed 454-sat network fee; an additional 7,000-sat approval was rejected because 4,000 sats were already reserved. Explicitly label these as first-hand production results and self-testing. Do not present the supplied purchase txid as independently verified: three current external lookups returned not found, and the refund id/evidence has not been reconciled from production.
4. **A decision does not move money.** Approval atomically reserves the available balance; a separate Paytaca signature authorizes a new transaction. Broadcast, observation, and confirmed inclusion are different states.
5. **What the chain can establish.** Only after checking exact transaction bytes: txid, matching output amount/index, block inclusion, block identity and provider witness. The merchant approval, association to the purchase, and 4,000/6,000 reservation ledger are ReturnTail records.
6. **Why it can matter.** Small BCH merchants can make direct partial refunds with an explicit decision trail while retaining wallet custody. Business hypothesis: paid support/audit tooling or hosted subscriptions; no traction or revenue claim is evidenced.
7. **Honest limits.** Self-test, not an external customer outcome; no custodial account; cannot prevent out-of-app transfers; xpub/pairing is not ownership proof; proof depends on public nodes/providers; current scope is standard P2PKH BCH and bounded receive discovery.
8. **Links and disclosure.** Live application, public GitHub, actual receipt once enabled, the existing deck, final demo once produced, CashTokens-compatible EMBER donation address, and source-work disclosure. Show only checked URLs and no private customer link, reason, wallet balance or credentials.

## Verification checklist before the slides state “confirmed”

- Independently locate the exact purchase and refund txids using two BCH providers; reconcile the supplied payment hash if it remains not found.
- Read the payment/refund output index, amount, block height/hash and current confirmation count from transaction data, not the slide or app label.
- Retrieve the refund database UUID and verify its logged-out public-safe receipt.
- Confirm the approved 4,000 and rejected 7,000 outcomes in the authenticated production order/accounting trail.
- Include the final commit SHA and only current, reproducible test totals. Do not copy old totals from prior release reports.
