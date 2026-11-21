# Physical-wallet address preflight — historical report and later result

## Reported result and funding gate

Paytaca **v0.27.3**, Android on **Samsung S24 Ultra**, successfully connected through WizardConnect. The original incorrect 100,000-sat request at index 0 remains preserved and unfunded; its destination and records were not rewritten. On November 21, the participant reported that the phone’s native BCH Receive address matched the advertised receiving chain at index 1. A separate 10,000-sat purchase and 4,000-sat refund were then completed and reconciled in [MAINNET_PROOF.md](MAINNET_PROOF.md). A public-chain/index match is not cryptographic proof of control. No claim is made here that the original index-zero request funded the confirmed purchase.

## Why zero differs

Reviewed the actual v0.27.3 release, rather than assuming current documentation matches the installed interface:

- [Native Receive component](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/pages/transaction/receive.vue): `getDisplayedAddressIndex` calls `ensureAddressIndexNotZero`. The source explicitly reserves `0/0` for message encryption and substitutes index one. Dynamic receive and New Address also skip zero; a later unused index may be selected. Turning automatic address generation off does not make zero visible. “Receive for” can select Personal or POS, which must not be confused.
- [Address generation](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/utils/address-generation-utils.js) skips receiving zero and derives native BCH from the BCH account.
- [WizardConnect service](https://github.com/paytaca/paytaca-app/blob/v0.27.3/src/wallet/wizardconnect/service.js): selected BCH account is `m/44'/145'/0'`, receiving chain `/0`, change chain `/1`. The protocol exports chain public keys, not a currently displayed receiving address. ReturnTail derives one child N from the advertised receiving chain; it does not append the account path again.

The deterministic derivation is consistent, but ReturnTail allocating zero was incompatible with Paytaca’s inspectable Receive addresses. Prior instructions to inspect zero in normal Receive were incorrect. Native token-aware versus standard encoding can change address text without changing the destination; a different index changes the destination. Different selected wallets/accounts or POS addresses can also produce mismatches. We have not received the actual addresses and do not claim which positive index the phone currently shows.

## Safe steps for this existing request

Update, November 21: the physical Paytaca preflight was reported to match the advertised receiving chain at **index 1**. The incorrect **100,000-satoshi** request remains unfunded at index 0. That reported public-address match is not cryptographic control proof. Use [safe cancellation and correction](PAYMENT_REQUEST_CANCELLATION.md) to retire the old request explicitly and create **10,000 satoshis / 0.00010000 BCH** on a fresh positive index, preferably 1 if still eligible. Compare the exact new destination before funding. The dated steps below explain the original stop condition.

1. Keep your existing request and merchant browser session until it is safely cancelled. Do not reset the wallet, re-save a different key, silently replace its destination, or share the private link publicly. After cancellation, use the explicit corrected-request action described above.
2. On Paytaca, select the same wallet used for the connection. Open **Receive**, choose BCH, and select **Personal** under **Receive for** if offered. Copy only its public receiving address. Do not open or export private keys or recovery material.
3. In that merchant browser, open `/wallet-check`, or the embedded comparison on your existing merchant request. Connect only if the connection is no longer available. Paste the native address and choose **Compare address locally**.
4. The checker searches receiving children 0–255 locally. It checks network and compares locking scripts, so standard and CashToken-aware encodings of one destination match. On the request it also compares the connected public chain’s child at the recorded index with the stored address. Nothing is uploaded or persisted by this comparison.
5. A native match at N > 0 explains the later-index address. It confirms consistency with the advertised public chain, **not control of hidden child zero**. No match is inconclusive beyond the bounded range; stop and investigate selected wallet/account, Receive-for selection and index range.
6. **Do not fund this index-zero request.** No safe supported method was found to make Paytaca v0.27.3 display that exact hidden child in its normal interface. WizardConnect hdwalletv1 exposes no standard arbitrary-address display or message-signing request; Paytaca does not advertise a compatible address-verification extension. SDK `getPubkey` only derives locally from the same cached public key and is not independent proof. Do not use fabricated signing requests or send money as a test.

**Historical determination at the November 20 stop point:** the existing exact index-zero destination was not independently verifiable in the reviewed native interface/protocol, so funding was stopped. The subsequent separate positive-index flow and mainnet result are recorded in the current proof ledger. This does not change or certify the old index-zero destination. New allocations start at one, but a positive index alone is not ownership proof.

Server preparation and first signed submission for zero are blocked. Already saved signed bytes, network observation and reconciliation remain available; an unknown broadcast must never be replaced automatically. This restriction is conservative for all index-zero merchant requests in this release, not a claim that zero is invalid BCH.

## Selene compatibility plan (written before the funded self-test)

Use a separate browser profile for the customer. Do not replace the merchant connection. Record installed Selene version. Source review covers the released [2026.10.02 integration](https://git.xulu.tech/selene.cash/selene-wallet/-/blob/2026.10.02/src/kernel/bch/WizardConnectService.tsx); confirm release path/version against the installed app before relying on it. Source compatibility is not a physical-wallet test result.

1. Select the intended BCH wallet in Selene and open its native Receive screen. Copy only that public address.
2. In the customer browser, connect Selene at `/wallet-check`, paste its native address, and compare locally. A receiving match reports the actual advertised-chain child. Wrong-network, absent chain or unresolved mismatch stops funding.
3. Checkout scans five receive indices from the entered starting index. It does not scan all wallet history or change-only balances. An empty wallet yields no eligible confirmed BCH without opening a signing prompt. Keep the merchant index-zero request unfunded; its preparation is intentionally blocked.
4. For a later authorized refund, copy a fresh native Selene receiving address and compare it. Do not derive a refund recipient from the payment’s first input. Recheck the exact destination in the merchant’s signing review.
5. Payment change comes from the connected wallet’s advertised **change** chain, child zero. The protocol uses named paths rather than assuming Selene’s account derivation. The real transaction must be recognized by Selene as belonging to the selected wallet and its change. A local change calculation is not independent control proof. Stop if the wallet does not recognize any source/change output.
6. Pairing, reconnect, disconnect and cancellation can be tested unfunded. Actual input ownership checks, rejection, fee display, change recognition, signature generation and broadcast require a later explicit funded-wallet test after the merchant-address gate is resolved.

## Evidence boundary

[Protocol](https://docs.riftenlabs.com/wizardconnect/protocol/) and [extensions](https://docs.riftenlabs.com/wizardconnect/extensions/) were reviewed with installed core 0.2.10, dapp 0.2.7, react 0.2.6. No signing keys are requested or stored. Automated parsing, transaction, network-failure and database tests use isolated local fixtures; they are separate from the verified mainnet proof. Set Production `PUBLIC_PROOF_REFUND_ID` to the confirmed refund record UUID in [MAINNET_PROOF.md](MAINNET_PROOF.md) to feature that receipt on `/evidence`.
