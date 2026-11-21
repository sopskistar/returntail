# Widget Factory deck — content for the existing Google Slides presentation

The existing deck is the presentation to finish. Do not create or substitute another deck. Its public URL has not been provided to this workspace, so its slides and `WIDGET_FACTORY_URL` cannot be edited or verified here. Use the organizer's [Widget Factory template](https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing) as required while preserving the existing deck's design. A damaged-parcel story is hypothetical framing, not this self-test.

## Recommended compact story

1. **After checkout is where trust gets tested.** A hypothetical damaged parcel makes the problem concrete: how can a merchant make a small refund without losing track of the customer, decision, destination, or payment?
2. **One connected workflow.** Unique-address BCH purchase → transaction verification → customer request → merchant decision → merchant wallet authorization → new BCH refund → privacy-limited public proof.
3. **The real self-test.** Two BCH mainnet providers independently confirm the Selene-reported 10,000-sat payment at `vout 0` and the Paytaca-reported 4,000-sat refund at `vout 0`; the refund spends the original output and paid a 454-sat fee. Link the exact transaction records and the public ReturnTail receipt UUID `6c5fb204-f24e-4fa1-b944-d4ff710ecb02`. Label the journey as a self-test, not an external customer. The participant reports that the 7,000-sat approval was blocked and the request rejected; the private audit entries remain to be checked in the authenticated merchant account.
4. **A decision does not move money.** Approval atomically reserves the available balance; a separate Paytaca signature authorizes a new transaction. Broadcast, observation, and confirmed inclusion are different states.
5. **What the chain establishes.** Transaction IDs, the exact output values/indexes, the refund’s spend of the purchase output, block heights/hashes, and provider inclusion/confirmation data. The merchant approval, refund/order association, 7,000-sat failed decision, and internal reservation history are ReturnTail application records.
6. **Why it can matter.** Small BCH merchants can make direct partial refunds with an explicit decision trail while retaining wallet custody. Business hypothesis: paid support/audit tooling or hosted subscriptions; no traction or revenue claim is evidenced.
7. **Honest limits.** Self-test, not an external customer outcome; no custodial account; cannot prevent out-of-app transfers; xpub/pairing is not ownership proof; proof depends on public nodes/providers; current scope is standard P2PKH BCH and bounded receive discovery.
8. **Links and disclosure.** Live application, public GitHub, actual receipt once enabled, the existing deck, final demo once produced, CashTokens-compatible EMBER donation address, and source-work disclosure. Show only checked URLs and no private customer link, reason, wallet balance or credentials.

## Verification checklist before the slides state “confirmed”

- Use the exact corrected payment hash and refund hash in [MAINNET_PROOF.md](MAINNET_PROOF.md), and retain both Selene and Blockchair links.
- Present the confirmation counts as an observed snapshot, not a current guarantee; explorer counts change as blocks arrive.
- Use the refund database UUID `6c5fb204-f24e-4fa1-b944-d4ff710ecb02` for the logged-out public receipt and for `PUBLIC_PROOF_REFUND_ID`.
- Confirm the approved 4,000 and rejected 7,000 outcomes in the authenticated production order/accounting trail.
- Include the final commit SHA and only current, reproducible test totals. Do not copy old totals from prior release reports.
